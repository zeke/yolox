import OpenAI from 'openai'
import Anthropic from '@anthropic-ai/sdk'

export function createClient (provider) {
  let client
  switch (provider) {
    case 'openai':
      client = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
      })

      client.completionOptions = {
        stream: true
      }

      break
    case 'replicate':
      client = new OpenAI({
        apiKey: process.env.REPLICATE_API_TOKEN,
        baseURL: 'https://openai-proxy.replicate.com/v1'
      })

      // Lifeboat and OpenAI have slight differences...
      client.completionOptions = {
        maxTokens: 64,
        stream: true
      }

      break
    case 'anthropic':
      client = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY
      })

      // Create an OpenAI-compatible wrapper for Anthropic's API
      client.chat = {
        completions: {
          create: async (options) => {
            const { model, messages } = options
            const userMessage = messages.find(m => m.role === 'user')

            const stream = await client.messages.stream({
              model,
              max_tokens: 1024,
              messages: [{ role: 'user', content: userMessage.content }]
            })

            // Create an async generator that yields OpenAI-compatible chunks
            return (async function * () {
              for await (const event of stream) {
                if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
                  yield {
                    choices: [{
                      delta: {
                        content: event.delta.text
                      }
                    }]
                  }
                }
              }
            })()
          }
        }
      }

      client.completionOptions = {
        stream: true
      }

      break
  }

  return client
}
