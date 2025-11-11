#!/usr/bin/env node

import { spawn } from 'node:child_process'
import minimist from 'minimist'
import { createClient } from './client.js'

import { readFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'

const argv = minimist(process.argv.slice(2), {
  boolean: ['print', 'version'],
  alias: { v: 'version' }
})
let englishCommand = argv._.join(' ')
const model = argv.model || 'gpt-4o'
const printMode = argv.print || false

// Handle version command
if (argv.version) {
  const packageJson = JSON.parse(await readFile(new URL('./package.json', import.meta.url), 'utf8'))
  console.log(packageJson.version)
  process.exit(0)
}

const models = {
  llama: 'replicate:meta/meta-llama-3.1-405b-instruct',
  llama3: 'replicate:meta/meta-llama-3-70b-instruct',
  llama31: 'replicate:meta/meta-llama-3.1-405b-instruct',
  'gpt-4o': 'openai:gpt-4o',
  gpt4: 'openai:gpt-4o'
}

if (!englishCommand) {
  console.log('Usage: yolox <english-command>')
  console.log('       yolox --version|-v')
  console.log('')
  console.log('Examples:')
  console.log('  yolox "list png files in current directory with human-friendly sizes"')
  console.log('  echo "data" | yolox "process this data"')
  process.exit()
}

if (!models[model]) {
  console.error(`Error: Model '${model}' is not supported.`)
  console.log('Available models are:', Object.keys(models).join(', '))
  process.exit()
}

if (englishCommand && !englishCommand.includes(' ')) {
  const filePath = resolve(process.cwd(), englishCommand)
  if (existsSync(filePath)) {
    try {
      englishCommand = (await readFile(filePath, 'utf8')).trim()
    } catch (error) {
      console.error(`Error reading file: ${error.message}`)
      process.exit(1)
    }
  }
}

// Read from stdin if data is piped
let stdinData = ''
if (!process.stdin.isTTY) {
  try {
    for await (const chunk of process.stdin) {
      stdinData += chunk
    }
    stdinData = stdinData.trim()
  } catch (error) {
    console.error(`Error reading from stdin: ${error.message}`)
    process.exit(1)
  }
}

const provider = models[model].split(':')[0]
const modelFullName = models[model].split(':')[1]
const client = createClient(provider)

let prompt = `Write a one-line shell command to ${englishCommand}.`

// If we have stdin data, include it in the prompt context
if (stdinData) {
  prompt = `Given this input data:\n\n${stdinData}\n\nWrite a one-line shell command to ${englishCommand}.`
}

const fullPrompt = [
  prompt,
  'If using ImageMagick: The convert command is deprecated in IMv7, use "magick" instead of "convert" or "magick convert"',
  'Do not write code that will delete files or folders.',
  'Do not explain the code.',
  'Do not fence the code.',
  'No code fencing.',
  'Just show the command.'
].join(' ')

console.log(`Model: ${modelFullName}`)

const options = {
  model: modelFullName,
  messages: [
    {
      role: 'user',
      content: fullPrompt
    }
  ],
  ...client.completionOptions
}

const completions = await client.chat.completions.create(options)

const output = []
for await (const part of completions) {
  output.push(part.choices[0]?.delta?.content || '')
}
const shellCommand = output.join('')

console.log(`Command: ${shellCommand}`)
console.log('')

if (printMode) {
  process.exit()
}

const child = spawn(shellCommand, { shell: true })

child.stdout.on('data', (data) => {
  process.stdout.write(data)
})

child.stderr.on('data', (data) => {
  process.stderr.write(data)
})

child.on('error', (error) => {
  console.error(`\nError executing command: ${error.message}`)
})

child.on('close', (code) => {
  if (code === 0) {
    console.log(`\n✅ Success! Child process exited with code ${code}`)
  } else {
    console.log(`\n❌ Error! Child process exited with code ${code}`)
  }
})
