import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.REPLICATE_API_TOKEN,
  baseURL: 'https://openai-proxy.replicate.com/v1'
})

const completions = await openai.chat.completions.create({
  model: 'meta/meta-llama-3-70b-instruct',
  messages: [
    {
      role: 'user',
      content: 'Write a haiku about camelids'
    }
  ],
  maxTokens: 64
})
for await (const part of completions) {
  process.stdout.write(part.choices[0]?.delta?.content || '')
}
