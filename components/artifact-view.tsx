'use client'
import { useState, useEffect } from 'react'
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
      <div className="whitespace-pre-wrap">{artifact.content}</div>
      {artifact.commentary && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <h2 className="text-xl font-semibold mb-2">Commentary</h2>
          <div className="whitespace-pre-wrap">{artifact.commentary}</div>
        </div>
      )}
    </div>
  )
}
