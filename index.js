import OpenAI from 'openai'
import { execSync } from 'node:child_process'
import minimist from 'minimist'

const argv = minimist(process.argv.slice(2))
const englishCommand = argv._.join(' ')
let model = argv.model || 'gpt-4o'

// Support shorthands
if (model === 'llama' || model === 'llama3') {
  model = 'meta/llama-3-70b-instruct'
}

let client
let completionOptions

// Use Replicate Lifeboat -- https://lifeboat.replicate.dev
if (model === 'meta/llama-3-70b-instruct') {
  client = new OpenAI({
    apiKey: process.env.REPLICATE_API_TOKEN,
    baseURL: 'https://openai-proxy.replicate.com/v1'
  })
  completionOptions = {
    maxTokens: 64,
    stream: false
  }
} else {
  client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  })
  completionOptions = {
    stream: true
  }
}

const prompt = [
  `Write a one-line shell command to ${englishCommand}.`,
  'Do not write code that will delete files or folders.',
  'Do not explain the code.',
  'Do not fence the code.',
  'No code fencing.',
  'Just show the command.'
].join(' ')

console.log(`Model: ${model}`)

const options = {
  model,
  messages: [
    {
      role: 'user',
      content: prompt
    }
  ],
  ...completionOptions
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
