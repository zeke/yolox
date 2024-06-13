#!/usr/bin/env node

import { execSync } from 'node:child_process'
import minimist from 'minimist'
import { createClient } from './client.js'

const argv = minimist(process.argv.slice(2))
const englishCommand = argv._.join(' ')
const model = argv.model || 'gpt-4o'

const models = {
  llama: 'replicate:meta/meta-llama-3-70b-instruct',
  llama3: 'replicate:meta/meta-llama-3-70b-instruct',
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

try {
  console.log(`Command: ${shellCommand}`)
  console.log('')
  const result = execSync(shellCommand).toString()
  console.log(result)
} catch (error) {
  console.error(`Error executing command: ${error.message}`)
}
