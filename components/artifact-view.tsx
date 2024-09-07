'use client'
import { ArtifactSchema } from '@/lib/schema'

export function ArtifactView({
  artifact,
}: {
  artifact: ArtifactSchema
}) {
  if (!artifact) return null

  return (
    <div className="w-full h-full p-4 overflow-y-auto">
      <h1 className="text-2xl font-bold mb-2">{artifact.title}</h1>
      <p className="text-gray-600 mb-4">{artifact.description}</p>
      <div className="whitespace-pre-wrap mb-4">{artifact.content}</div>
    </div>
  )
}
