import { useState, useEffect, useCallback, createContext, useContext } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import ShortcutRenderer from '@/components/ShortcutRenderer'
import { isModifierKey, getShortcutAccelerator } from '@/lib/utils/keyboard'
import { useShortcutsStore } from '@/lib/store/shortcuts'
import { useSettingsStore } from '@/lib/store/settings'

const ShortcutsContext = createContext<{
  recordingAction: string | null
  setRecordingAction: (action: string | null) => void
}>({
  recordingAction: null,
  setRecordingAction: () => {}
})

export function CustomShortcuts() {
  const { shortcuts, updateShortcut } = useShortcutsStore()
  const { assemblyaiApiKey } = useSettingsStore()
  const [recordingAction, setRecordingAction] = useState<string | null>(null)

  const onShortcutChange = useCallback(
    (action: string, key: string) => {
      const newShortcut = { ...shortcuts[action], key }
      updateShortcut(action, newShortcut)
      window.api.updateShortcuts([newShortcut])
    },
    [shortcuts, updateShortcut]
  )

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!recordingAction) return

      e.preventDefault()

      if (isModifierKey(e.code)) return
      const accelerator = getShortcutAccelerator(e)
      // User press escape to cancel recording.
      if (e.code === 'Escape' && !accelerator) {
        setRecordingAction(null)
      }
      if (!accelerator) return
      onShortcutChange(recordingAction, accelerator)
      setRecordingAction(null)
    },
    [recordingAction, onShortcutChange]
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleKeyDown])

  return (
    <ShortcutsContext.Provider value={{ recordingAction, setRecordingAction }}>
      <div className="space-y-4">
        {/* Window Management */}
        <div className="space-y-2">
          <h3 className="text-sm text-gray-500">Window Management</h3>
          <Shortcut label="Hide/show window" shortcut="hideOrShowMainWindow" />
          <Shortcut
            label="Mouse passthrough"
            description="Lets mouse input pass through to content behind the window"
            shortcut="ignoreOrEnableMouse"
          />
          <Shortcut
            label="Increase opacity"
            description="Makes the window 5% more visible"
            shortcut="increaseOpacity"
          />
          <Shortcut
            label="Decrease opacity"
            description="Makes the window 5% more transparent"
            shortcut="decreaseOpacity"
          />
        </div>

        {/* Screenshot & AI */}
        <div className="space-y-2">
          <h3 className="text-sm text-gray-500">Screenshot &amp; AI</h3>
          <Shortcut
            label="Take screenshot"
            description="Captures the screen and starts a new solution conversation"
            shortcut="takeScreenshot"
          />
          <Shortcut
            label="Add screenshot"
            description="Adds another screenshot to the current conversation"
            shortcut="appendScreenshot"
          />
          <Shortcut
            label="Stop generating"
            description="Stops the solution currently being generated"
            shortcut="stopSolutionStream"
          />
          <Shortcut
            label="Speech transcription"
            description="Starts or pauses real-time transcription"
            shortcut="toggleTranscription"
            disabled={!assemblyaiApiKey}
          />
          <Shortcut
            label="Clear transcript"
            description="Clears transcribed text without submitting it to AI"
            shortcut="clearTranscription"
            disabled={!assemblyaiApiKey}
          />
          <Shortcut
            label="Clear session"
            description="Clears screenshots, transcript, generated output, and conversation history"
            shortcut="clearSession"
          />
        </div>

        {/* Navigation */}
        <div className="space-y-2">
          <h3 className="text-sm text-gray-500">Navigation</h3>
          <Shortcut label="Page up" shortcut="pageUp" />
          <Shortcut label="Page down" shortcut="pageDown" />
        </div>

        {/* Window Movement */}
        <div className="space-y-2">
          <h3 className="text-sm text-gray-500">Window Movement</h3>
          <Shortcut label="Move window up" shortcut="moveMainWindowUp" />
          <Shortcut label="Move window down" shortcut="moveMainWindowDown" />
          <Shortcut label="Move window left" shortcut="moveMainWindowLeft" />
          <Shortcut label="Move window right" shortcut="moveMainWindowRight" />
        </div>
      </div>
    </ShortcutsContext.Provider>
  )
}

function Shortcut({
  label,
  description,
  shortcut: shortcutAction,
  disabled
}: {
  label: string
  description?: string
  shortcut: string
  disabled?: boolean
}) {
  const { shortcuts } = useShortcutsStore()
  const { recordingAction, setRecordingAction } = useContext(ShortcutsContext)
  const shortcut = shortcuts[shortcutAction]
  const isRecording = recordingAction === shortcutAction

  return shortcut ? (
    <div
      className={`flex items-center justify-between${disabled ? ' opacity-40 pointer-events-none' : ''}`}
    >
      <div className="flex gap-2 items-center">
        <label className="text-sm font-medium">{label}</label>
        {description && <p className="text-xs font-light">{description}</p>}
      </div>
      <span
        className="cursor-pointer"
        onClick={() => setRecordingAction(isRecording ? null : shortcutAction)}
      >
        {!isRecording ? (
          <ShortcutRenderer shortcut={shortcut.key} />
        ) : (
          <span className="font-mono text-sm align-middle rounded-md pl-2 pr-1 py-1 transition-colors bg-gray-200 animate-pulse">
            Press your new shortcut...
          </span>
        )}
      </span>
    </div>
  ) : null
}

export function ResetDefaultShortcuts() {
  const { shortcuts, resetShortcuts } = useShortcutsStore()
  return (
    <Button
      variant="outline"
      size="sm"
      className="ml-auto"
      onClick={async () => {
        await window.api.updateShortcuts(
          Object.values(shortcuts)
            .filter(({ key, defaultKey }) => key !== defaultKey)
            .map((shortcut) => ({
              ...shortcut,
              key: shortcut.defaultKey
            }))
        )
        resetShortcuts()
        toast.success('Default shortcuts restored')
      }}
    >
      Restore default shortcuts
    </Button>
  )
}
