'use client'

import { useEffect, useState } from 'react'
import { experimental_useObject as useObject } from 'ai/react'
import { useLocalStorage } from 'usehooks-ts'
import { usePostHog } from 'posthog-js/react'
import { ArtifactSchema, artifactSchema as schema } from '@/lib/schema'

import { Chat } from '@/components/chat'
import { SideView } from '@/components/side-view'
import NavBar from '@/components/navbar'

import { supabase } from '@/lib/supabase'
import { AuthDialog } from '@/components/AuthDialog'
import { useAuth } from '@/lib/auth'

import { LLMModel, LLMModelConfig } from '@/lib/models'
import modelsList from '@/lib/models.json'

export type Message = {
  role: 'user' | 'assistant'
  content: string
  meta?: {
    title?: string
    description?: string
  }
}

export default function Home() {
  const [chatInput, setChatInput] = useLocalStorage('chat', '')
  const [languageModel, setLanguageModel] = useLocalStorage<LLMModelConfig>('languageModel', {
    model: 'claude-3-5-sonnet-20240620'
  })

  const posthog = usePostHog()

  const [messages, setMessages] = useState<Message[]>([])

  const [isAuthDialogOpen, setAuthDialog] = useState(false)
  const { session, apiKey } = useAuth(setAuthDialog)

  const currentModel = modelsList.models.find(model => model.id === languageModel.model)

  const { object: artifact, submit, isLoading, stop, error } = useObject({
    api: '/api/chat',
    schema,
    onFinish: async ({ object: artifact, error }) => {
      if (!error) {
        console.log('artifact', artifact)
        // We don't need to call the /api/sandbox endpoint anymore
      }
    }
  })

  useEffect(() => {
    if (artifact) {
      const lastAssistantMessage = messages.findLast(message => message.role === 'assistant')
      if (lastAssistantMessage) {
        lastAssistantMessage.content = artifact.commentary || ''
        lastAssistantMessage.meta = {
          title: artifact.title,
          description: artifact.description
        }
      }
    }
  }, [artifact])

  function handleSubmitAuth(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (!session) {
      return setAuthDialog(true)
    }

    if (isLoading) {
      stop()
    }

    submit({
      userID: session?.user?.id,
      prompt: chatInput,
      model: currentModel,
      config: languageModel,
    })

    addMessage({
      role: 'user',
      content: chatInput
    })

    addMessage({
      role: 'assistant',
      content: 'Generating response...',
    })

    setChatInput('')

    posthog.capture('chat_submit', {
      model: languageModel.model,
    })
  }

  function addMessage(message: Message) {
    setMessages(previousMessages => [...previousMessages, message])
  }

  function handleSaveInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setChatInput(e.target.value)
  }

  function logout() {
    supabase ? supabase.auth.signOut() : console.warn('Supabase is not initialized')
  }

  function handleLanguageModelChange(e: LLMModelConfig) {
    setLanguageModel({ ...languageModel, ...e })
  }

  function handleGitHubClick() {
    window.open('https://github.com/e2b-dev/ai-artifacts', '_blank')
    posthog.capture('github_click')
  }

  return (
    <main className="flex min-h-screen max-h-screen">
      {
        supabase && <AuthDialog open={isAuthDialogOpen} setOpen={setAuthDialog} supabase={supabase} />
      }
      <NavBar
        session={session}
        showLogin={() => setAuthDialog(true)}
        signOut={logout}
        models={modelsList.models}
        languageModel={languageModel}
        onLanguageModelChange={handleLanguageModelChange}
        onGitHubClick={handleGitHubClick}
        apiKeyConfigurable={!process.env.NEXT_PUBLIC_USE_HOSTED_MODELS}
        baseURLConfigurable={!process.env.NEXT_PUBLIC_USE_HOSTED_MODELS}
      />

      <div className="flex-1 flex space-x-8 w-full pt-36 pb-8 px-4">
        <Chat
          isLoading={isLoading}
          stop={stop}
          messages={messages}
          input={chatInput}
          handleInputChange={handleSaveInputChange}
          handleSubmit={handleSubmitAuth}
        />
        <SideView
          isLoading={isLoading}
          artifact={artifact as ArtifactSchema}
        />
      </div>
    </main>
  )
}
