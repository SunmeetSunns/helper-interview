import { useEffect } from 'react'
import { useSettingsStore } from '@/lib/store/settings'
import { useAppStore } from '@/lib/store/app'
import { useTranscriptionStore } from '@/lib/store/transcription'
import { useSolutionStore } from '@/lib/store/solution'
import { startAudioCapture, stopAudioCapture } from '@/lib/audio-capture'

import { AppHeader } from './AppHeader'
import { AppContent } from './AppContent'
import { AppStatusBar } from './AppStatusBar'
import { PrerequisitesChecker } from './PrerequisitesChecker'
import { TranscriptionBar } from './TranscriptionBar'

export default function CoderPage() {
  const { opacity, assemblyaiApiKey } = useSettingsStore()
  const { syncAppState } = useAppStore()
  const { isTranscribing, setIsTranscribing, setTranscriptionText, clearText } =
    useTranscriptionStore()
  const { setErrorMessage } = useSolutionStore()

  useEffect(() => {
    document.body.style.opacity = opacity.toString()
    return () => {
      document.body.style.opacity = ''
    }
  }, [opacity])

  useEffect(() => {
    window.api.onAdjustOpacity((delta) => {
      useSettingsStore.getState().adjustOpacity(delta)
    })
    return () => {
      window.api.removeAdjustOpacityListener()
    }
  }, [])

  useEffect(() => {
    window.api.updateAppState({ inCoderPage: true })
    return () => {
      window.api.updateAppState({ inCoderPage: false })
    }
  }, [])

  useEffect(() => {
    window.api.onSyncAppState((state) => {
      syncAppState(state)
    })
    return () => {
      window.api.removeSyncAppStateListener()
    }
  }, [syncAppState])

  useEffect(() => {
    const handleToggle = async () => {
      if (isTranscribing) {
        stopAudioCapture()
        await window.api.stopTranscription()
        setIsTranscribing(false)
      } else {
        if (!assemblyaiApiKey) {
          setErrorMessage('Configure your AssemblyAI API key in Settings first')
          return
        }
        try {
          await startAudioCapture()
          await window.api.startTranscription(assemblyaiApiKey)
          setIsTranscribing(true)
          setErrorMessage(null)
        } catch (err) {
          console.error('Failed to start transcription:', err)
          stopAudioCapture()
          const detail = err instanceof Error ? err.message : 'Unknown audio capture error'
          setErrorMessage(`Could not start transcription: ${detail}`)
        }
      }
    }

    window.api.onToggleTranscription(handleToggle)
    return () => {
      window.api.removeToggleTranscriptionListener()
    }
  }, [isTranscribing, assemblyaiApiKey, setIsTranscribing, setErrorMessage])

  useEffect(() => {
    window.api.onTranscriptionText((data) => {
      setTranscriptionText(data.text)
    })
    window.api.onTranscriptionError((message) => {
      setErrorMessage(message)
      setIsTranscribing(false)
      stopAudioCapture()
    })
    window.api.onTranscriptionStopped(() => {
      setIsTranscribing(false)
      stopAudioCapture()
    })
    window.api.onTranscriptionCleared(() => {
      clearText()
      setErrorMessage(null)
    })

    return () => {
      window.api.removeTranscriptionTextListener()
      window.api.removeTranscriptionErrorListener()
      window.api.removeTranscriptionStoppedListener()
      window.api.removeTranscriptionClearedListener()
    }
  }, [setTranscriptionText, setErrorMessage, setIsTranscribing, clearText])

  useEffect(() => {
    return () => {
      if (useTranscriptionStore.getState().isTranscribing) {
        stopAudioCapture()
        window.api.stopTranscription()
      }
    }
  }, [])

  return (
    <div className="relative h-screen">
      <AppHeader />
      <AppContent />
      <TranscriptionBar />
      <AppStatusBar />
      <PrerequisitesChecker />
    </div>
  )
}
