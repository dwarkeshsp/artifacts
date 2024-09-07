import {
  streamObject,
  LanguageModel,
} from 'ai'

import ratelimit from '@/lib/ratelimit'
import { Templates, templatesToPrompt } from '@/lib/templates'
import { getModelClient, getDefaultMode } from '@/lib/models'
import { LLMModel, LLMModelConfig } from '@/lib/models'
import { artifactSchema as schema } from '@/lib/schema'

export const maxDuration = 60

const rateLimitMaxRequests = 5
const ratelimitWindow = '1m'

export async function POST(req: Request) {
  const limit = await ratelimit(req, rateLimitMaxRequests, ratelimitWindow)
  if (limit) {
    return new Response('You have reached your request limit for the day.', {
      status: 429,
      headers: {
        'X-RateLimit-Limit': limit.amount.toString(),
        'X-RateLimit-Remaining': limit.remaining.toString(),
        'X-RateLimit-Reset': limit.reset.toString()
      }
    })
  }

  const { prompt, userID, model, config, currentArtifact }: {
    prompt: string,
    userID: string,
    model: LLMModel,
    config: LLMModelConfig,
    currentArtifact?: ArtifactSchema
  } = await req.json()

  const { model: modelNameString, apiKey: modelApiKey, ...modelParams } = config
  const modelClient = getModelClient(model, config)

  const systemPrompt = `You are a knowledgeable research assistant for a podcast host. Your role is to provide information and analysis on various topics. You should respond to queries and help prepare questions for future podcast guests. ${currentArtifact ? "You are updating an existing artifact. Modify the content based on the user's request." : "You are creating a new artifact."}`

  const stream = await streamObject({
    model: modelClient as LanguageModel,
    schema,
    system: systemPrompt,
    prompt: currentArtifact
      ? `Current artifact:\n${JSON.stringify(currentArtifact, null, 2)}\n\nUser request: ${prompt}`
      : prompt,
    mode: getDefaultMode(model),
    ...modelParams,
  })

  return stream.toTextStreamResponse()
}
