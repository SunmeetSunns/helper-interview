import { ipcMain } from 'electron'
import WebSocket from 'ws'

const SAMPLE_RATE = 16000
const SPEECH_MODEL = 'universal-3-5-pro'
const WS_URL =
  `wss://streaming.assemblyai.com/v3/ws?sample_rate=${SAMPLE_RATE}` +
  `&speech_model=${SPEECH_MODEL}&format_turns=true`

let ws: WebSocket | null = null
let isTranscribing = false
let sessionReady = false
let stopping = false
let terminationTimer: ReturnType<typeof setTimeout> | null = null
let accumulatedText = ''
let currentPartial = ''

function sendToRenderer(channel: string, ...args: unknown[]) {
  const mainWindow = global.mainWindow
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send(channel, ...args)
  }
}

function normalizeApiKey(apiKey: string): string {
  return apiKey.trim().replace(/^Bearer\s+/i, '')
}

function appendTranscript(text: string): void {
  const trimmed = text.trim()
  if (!trimmed) return
  accumulatedText += `${accumulatedText ? ' ' : ''}${trimmed}`
}

function emitTranscriptionText(isPartial: boolean): void {
  sendToRenderer('transcription-text', {
    text: getTranscriptionText(),
    isPartial
  })
}

function cleanup() {
  if (terminationTimer) {
    clearTimeout(terminationTimer)
    terminationTimer = null
  }
  if (ws) {
    ws.removeAllListeners()
    if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
      ws.close()
    }
    ws = null
  }
  isTranscribing = false
  sessionReady = false
  stopping = false
}

function finishTranscription() {
  appendTranscript(currentPartial)
  currentPartial = ''
  cleanup()
  emitTranscriptionText(false)
  sendToRenderer('transcription-stopped', { submit: true })
}

function startTranscription(apiKey: string) {
  if (isTranscribing) return

  const normalizedApiKey = normalizeApiKey(apiKey)
  if (!normalizedApiKey) {
    sendToRenderer('transcription-error', 'Configure your AssemblyAI API key in Settings first')
    sendToRenderer('transcription-stopped', { submit: false })
    return
  }

  cleanup()
  currentPartial = ''
  isTranscribing = true

  ws = new WebSocket(WS_URL, {
    headers: { Authorization: normalizedApiKey }
  })

  ws.on('message', (data: WebSocket.Data) => {
    try {
      const event = JSON.parse(data.toString())

      if (event.type === 'Begin') {
        sessionReady = true
        return
      }

      if (event.type === 'Turn') {
        const transcript = typeof event.transcript === 'string' ? event.transcript : ''
        if (event.end_of_turn === true) {
          appendTranscript(transcript)
          currentPartial = ''
          emitTranscriptionText(false)
        } else {
          currentPartial = transcript
          emitTranscriptionText(true)
        }
        return
      }

      if (event.type === 'Termination') {
        finishTranscription()
        return
      }

      if (event.type === 'Error') {
        const errorMessage = event.error || event.message || 'AssemblyAI transcription failed'
        console.error('AssemblyAI transcription error:', errorMessage)
        sendToRenderer('transcription-error', errorMessage)
        cleanup()
        sendToRenderer('transcription-stopped', { submit: false })
      }
    } catch (error) {
      console.error('Failed to parse AssemblyAI transcription message:', error)
    }
  })

  ws.on('error', (error) => {
    console.error('AssemblyAI transcription WebSocket error:', error)
    sendToRenderer('transcription-error', error.message || 'WebSocket connection failed')
    cleanup()
    sendToRenderer('transcription-stopped', { submit: false })
  })

  ws.on('close', (code, reason) => {
    const wasActive = isTranscribing || stopping
    const stoppedNormally = stopping || code === 1000
    if (terminationTimer) {
      clearTimeout(terminationTimer)
      terminationTimer = null
    }
    ws = null
    sessionReady = false
    isTranscribing = false
    stopping = false

    if (wasActive) {
      appendTranscript(currentPartial)
      currentPartial = ''
      emitTranscriptionText(false)
      if (!stoppedNormally) {
        const detail = reason.toString().trim()
        sendToRenderer(
          'transcription-error',
          detail || `AssemblyAI transcription connection closed (${code})`
        )
      }
      sendToRenderer('transcription-stopped', { submit: true })
    }
  })
}

function stopTranscription() {
  if (!isTranscribing && !stopping) return

  isTranscribing = false
  stopping = true

  if (ws && ws.readyState === WebSocket.OPEN && sessionReady) {
    ws.send(JSON.stringify({ type: 'Terminate' }))
    terminationTimer = setTimeout(() => finishTranscription(), 2000)
    return
  }

  finishTranscription()
}

function handleAudioChunk(chunk: ArrayBuffer) {
  if (!ws || ws.readyState !== WebSocket.OPEN || !sessionReady || stopping) return
  ws.send(Buffer.from(chunk))
}

export function getTranscriptionText(): string {
  const partial = currentPartial.trim()
  return `${accumulatedText}${accumulatedText && partial ? ' ' : ''}${partial}`
}

export function clearTranscriptionText() {
  accumulatedText = ''
  currentPartial = ''
}

/** Stop the active transcription connection and discard all text immediately. */
export function resetTranscriptionSession() {
  cleanup()
  clearTranscriptionText()
  sendToRenderer('transcription-cleared')
  sendToRenderer('transcription-stopped', { submit: false })
}

ipcMain.handle('start-transcription', (_event, apiKey: string) => {
  startTranscription(apiKey)
})

ipcMain.handle('stop-transcription', () => {
  stopTranscription()
})

ipcMain.on('transcription-audio-chunk', (_event, chunk: ArrayBuffer) => {
  handleAudioChunk(chunk)
})

ipcMain.handle('get-transcription-text', () => {
  return getTranscriptionText()
})

ipcMain.handle('clear-transcription-text', () => {
  clearTranscriptionText()
})
