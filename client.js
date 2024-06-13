import OpenAI from 'openai'

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
  }

  return client
}
