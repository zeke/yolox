import OpenAI from 'openai'
import { execSync } from 'node:child_process'

const model = 'gpt-4'
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

const englishCommand = process.argv.slice(2).join(' ')

const prompt = [
  `Write a one-line shell command to ${englishCommand}.`,
  'Do not write code that will delete files or folders.',
  'Do not explain the code.',
  'Do not fence the code.',
  'No code fencing.',
  'Just show the command.'
].join(' ')

const completions = await openai.chat.completions.create({
  model,
  messages: [
    {
      role: 'user',
      content: prompt
    }
  ],
  stream: true
})

const output = []
for await (const part of completions) {
  output.push(part.choices[0]?.delta?.content || '')
}

const shellCommand = output.join('')

try {
  console.log(`# ${shellCommand}\n`)
  const result = execSync(shellCommand).toString()
  console.log(result)
} catch (error) {
  console.error(`Error executing command: ${error.message}`)
}
