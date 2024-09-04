#!/usr/bin/env node

import { spawn } from 'node:child_process'
import minimist from 'minimist'
import { createClient } from './client.js'

import { readFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'

const argv = minimist(process.argv.slice(2), {
  boolean: ['print']
})
let englishCommand = argv._.join(' ')
const model = argv.model || 'gpt-4o'
const printMode = argv.print || false

const models = {
  llama: 'replicate:meta/meta-llama-3.1-405b-instruct',
  llama3: 'replicate:meta/meta-llama-3-70b-instruct',
  llama31: 'replicate:meta/meta-llama-3.1-405b-instruct',
  'gpt-4o': 'openai:gpt-4o',
  gpt4: 'openai:gpt-4o'
}

if (!englishCommand) {
  console.log('Usage: yolox <english-command>')
  console.log('Example: yolox "list png files in current directory with human-friendly sizes"')
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

const provider = models[model].split(':')[0]
const modelFullName = models[model].split(':')[1]
const client = createClient(provider)

const prompt = [
  `Write a one-line shell command to ${englishCommand}.`,
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
      content: prompt
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
