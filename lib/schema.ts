import { z } from 'zod'

export const artifactSchema = z.object({
  commentary: z.string().describe(`Provide analysis and thoughts on the topic.`),
  content: z.string().describe('The main text content of the document, including any prepared questions.'),
  title: z.string().describe('Short title for the response. Max 50 characters.'),
  description: z.string().describe('Brief description of the response. Max 100 characters.'),
})

export type ArtifactSchema = z.infer<typeof artifactSchema>
