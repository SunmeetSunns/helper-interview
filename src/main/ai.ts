import { streamText, type ModelMessage } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'
import { settings, AppSettings } from './settings'

const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1'

function getProviderSettings() {
  const apiKey = settings.apiKey.trim().replace(/^Bearer\s+/i, '')
  const configuredBaseURL = settings.apiBaseURL.trim().replace(/\/+$/, '')
  const isOpenRouter =
    apiKey.startsWith('sk-or-') ||
    /^https:\/\/(www\.)?openrouter\.ai(?:\/|$)/i.test(configuredBaseURL)
  const baseURL = isOpenRouter
    ? configuredBaseURL.replace(/^https:\/\/(www\.)?openrouter\.ai\/?$/i, OPENROUTER_BASE_URL) ||
      OPENROUTER_BASE_URL
    : configuredBaseURL || undefined

  return {
    baseURL,
    apiKey,
    // Keep this explicit for OpenAI-compatible gateways such as OpenRouter.
    // It also prevents a pasted "Bearer ..." prefix from producing a malformed header.
    headers: { Authorization: `Bearer ${apiKey}` }
  }
}

// The system prompt is fully managed by the renderer (prompt scenes in the
// settings store) and synced here via updateAppSettings on app startup
function getSystemPrompt(extra?: string) {
  return [settings.customPrompt, extra].filter(Boolean).join('\n\n') || undefined
}

function getModel(_settings: AppSettings) {
  const fallbackModel = settings.apiBaseURL.includes('siliconflow')
    ? 'Qwen/Qwen3-VL-32B-Instruct'
    : 'gpt-5-mini'
  return _settings.model || fallbackModel
}

export function getSolutionStream(messages: ModelMessage[], abortSignal?: AbortSignal) {
  const openai = createOpenAI(getProviderSettings())

  const { textStream } = streamText({
    model: openai.chat(getModel(settings)),
    system: getSystemPrompt(),
    messages,
    abortSignal,
    onError: (err) => {
      throw err.error ?? err
    }
  })
  return textStream
}

export function getFollowUpStream(
  messages: ModelMessage[],
  userQuestion: string,
  abortSignal?: AbortSignal
) {
  const openai = createOpenAI(getProviderSettings())

  // Add the user's follow-up question to the conversation
  const updatedMessages: ModelMessage[] = [
    ...messages,
    {
      role: 'user',
      content: [
        {
          type: 'text',
          text: userQuestion
        }
      ]
    }
  ]

  const { textStream } = streamText({
    model: openai.chat(getModel(settings)),
    system: getSystemPrompt(),
    messages: updatedMessages,
    abortSignal,
    onError: (err) => {
      throw err.error ?? err
    }
  })
  return textStream
}

export function getGeneralStream(messages: ModelMessage[], abortSignal?: AbortSignal) {
  const openai = createOpenAI(getProviderSettings())

  const { textStream } = streamText({
    model: openai.chat(getModel(settings)),
    system: getSystemPrompt(
      'If there are multiple screenshots, analyze all of them together without omitting any part.'
    ),
    messages,
    abortSignal,
    onError: (err) => {
      throw err.error ?? err
    }
  })
  return textStream
}
