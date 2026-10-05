import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import {
  ArrowLeft,
  SquareTerminal,
  Palette,
  Shield,
  Bot,
  Eye,
  EyeOff,
  Keyboard,
  FolderOpen,
  Mic,
  Plus,
  RotateCcw,
  X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import {
  useSettingsStore,
  PRESET_SCENE_PROMPTS,
  type ScreenshotDisplay,
  OPACITY_MIN,
  OPACITY_MAX,
  OPACITY_STEP
} from '@/lib/store/settings'
import { isMac } from '@/lib/utils/env'
import { SelectModel } from './SelectModel'
import { CustomShortcuts, ResetDefaultShortcuts } from './CustomShortcuts'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'

export default function SettingsPage() {
  const {
    opacity,
    resizable,
    showOverlayToolbar,
    toolbarHoverDelay,
    screenshotDisplay,
    apiBaseURL,
    apiKey,
    model,
    scenes,
    activeSceneId,
    screenshotAutoSave,
    screenshotDir,
    assemblyaiApiKey,
    audioInputDeviceId,
    audioOutputDeviceId,
    hideDockIcon,
    updateSetting,
    setActiveScene,
    updateScenePrompt,
    addScene,
    removeScene
  } = useSettingsStore()
  const [showApiKey, setShowApiKey] = useState(false)
  const [showAssemblyAIKey, setShowAssemblyAIKey] = useState(false)
  const [addSceneOpen, setAddSceneOpen] = useState(false)
  const [newSceneName, setNewSceneName] = useState('')
  const [sceneToDelete, setSceneToDelete] = useState<string | null>(null)

  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([])

  const activeScene = scenes.find((s) => s.id === activeSceneId)
  const deletingScene = scenes.find((s) => s.id === sceneToDelete)

  useEffect(() => {
    return () => {
      document.body.style.opacity = ''
    }
  }, [])

  useEffect(() => {
    const loadDevices = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices()
        const needsPermission = devices.every((d) => !d.label)
        if (needsPermission) {
          await navigator.mediaDevices.getUserMedia({ audio: true, video: false })
        }
        const refreshed = await navigator.mediaDevices.enumerateDevices()
        setAudioDevices(refreshed)
      } catch (err) {
        console.error('Failed to enumerate audio devices:', err)
      }
    }
    loadDevices()
  }, [])

  const handleAddScene = () => {
    const name = newSceneName.trim()
    if (!name) return
    addScene(name)
    setNewSceneName('')
    setAddSceneOpen(false)
  }

  const handleResetScenePrompt = () => {
    if (!activeScene?.isPreset) return
    updateScenePrompt(activeScene.id, PRESET_SCENE_PROMPTS[activeScene.id] ?? '')
  }

  return (
    <>
      {/* Header */}
      <div id="app-header" className="flex items-center">
        <div className="actions">
          <Button variant="ghost" asChild size="icon" className="w-12 mr-2 rounded-none">
            <Link to="/">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
        </div>
        <h1>Settings</h1>
      </div>

      {/* Settings Content */}
      <div id="app-content" className="flex flex-col gap-4 p-8">
        {/* AI Settings */}
        <div className="bg-gray-300/80 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <Bot className="h-5 w-5 mr-2" />
            AI Settings
          </h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">
                API Base URL
                <span className="ml-2 text-xs font-light">
                  Gemini keys are detected automatically; for example, OpenRouter:
                  https://openrouter.ai/api/v1
                </span>
              </label>
              <input
                type="text"
                value={apiBaseURL}
                onChange={(e) => updateSetting('apiBaseURL', e.target.value)}
                className="w-60 px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="URL only — do not paste a curl command"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">API Key</label>
              <div className="flex items-center w-60">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => updateSetting('apiKey', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter API key"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="border border-l-0 rounded-l-none rounded-r-md h-9 w-9 hover:border-none"
                >
                  {showApiKey ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">
                Model
                <span className="ml-2 text-xs font-light">
                  Confirm that your selected provider supports the model
                </span>
              </label>
              <SelectModel value={model} onChange={(val) => updateSetting('model', val)} />
            </div>
          </div>
        </div>
        {/* Transcription Settings */}
        <div className="bg-gray-300/80 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <Mic className="h-5 w-5 mr-2" />
            Speech Transcription
          </h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">
                AssemblyAI API Key
                <span className="ml-2 text-xs font-light">
                  Used only for live speech transcription
                </span>
              </label>
              <div className="flex items-center w-60">
                <input
                  type={showAssemblyAIKey ? 'text' : 'password'}
                  value={assemblyaiApiKey}
                  onChange={(e) => updateSetting('assemblyaiApiKey', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter AssemblyAI API key"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowAssemblyAIKey(!showAssemblyAIKey)}
                  className="border border-l-0 rounded-l-none rounded-r-md h-9 w-9 hover:border-none"
                >
                  {showAssemblyAIKey ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">
                Audio input device
                <span className="ml-2 text-xs font-light">
                  System audio captures speaker output, not your microphone
                </span>
              </label>
              <Select
                value={audioInputDeviceId || 'system'}
                onValueChange={(val) =>
                  updateSetting('audioInputDeviceId', val === 'system' ? '' : val)
                }
              >
                <SelectTrigger className="w-60 bg-white">
                  <SelectValue placeholder="System audio (default)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="system">System audio (default)</SelectItem>
                  {audioDevices
                    .filter((d) => d.kind === 'audioinput')
                    .map((d) => (
                      <SelectItem key={d.deviceId} value={d.deviceId}>
                        {d.label || d.deviceId}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">
                Audio output device
                <span className="ml-2 text-xs font-light">Monitoring output for transcription</span>
              </label>
              <Select
                value={audioOutputDeviceId || 'default'}
                onValueChange={(val) =>
                  updateSetting('audioOutputDeviceId', val === 'default' ? '' : val)
                }
              >
                <SelectTrigger className="w-60 bg-white">
                  <SelectValue placeholder="Default device" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default device</SelectItem>
                  {audioDevices
                    .filter((d) => d.kind === 'audiooutput')
                    .map((d) => (
                      <SelectItem key={d.deviceId} value={d.deviceId}>
                        {d.label || d.deviceId}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <div className="bg-gray-300/80 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <SquareTerminal className="h-5 w-5 mr-2" />
            Solution Settings
          </h2>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">
                Scene
                <span className="ml-2 text-xs font-light">
                  Select a scene to edit its system prompt, or create your own
                </span>
              </label>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                {scenes.map((scene) => (
                  <div
                    key={scene.id}
                    className={cn(
                      'group flex items-center rounded-full border text-sm transition-colors cursor-pointer select-none',
                      scene.id === activeSceneId
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'bg-white border-gray-300 hover:border-blue-400'
                    )}
                    onClick={() => setActiveScene(scene.id)}
                  >
                    <span className={cn('py-1 pl-3', scene.isPreset ? 'pr-3' : 'pr-1')}>
                      {scene.name}
                    </span>
                    {!scene.isPreset && (
                      <button
                        className="mr-1.5 p-0.5 rounded-full opacity-60 hover:opacity-100 hover:bg-black/10"
                        title="Delete this scene"
                        onClick={(e) => {
                          e.stopPropagation()
                          setSceneToDelete(scene.id)
                        }}
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  className="flex items-center gap-1 rounded-full border border-dashed border-gray-400 bg-transparent px-3 py-1 text-sm text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors"
                  onClick={() => setAddSceneOpen(true)}
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add scene
                </button>
              </div>
            </div>

            {activeScene && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm font-medium">
                    System prompt
                    <span className="ml-2 text-xs font-light">{activeScene.name} scene</span>
                  </label>
                  {activeScene.isPreset && (
                    <button
                      className="flex items-center gap-1 text-xs text-gray-600 hover:text-gray-900 transition-colors"
                      title="Restore the default prompt for this scene"
                      onClick={handleResetScenePrompt}
                    >
                      <RotateCcw className="h-3 w-3" />
                      Restore default
                    </button>
                  )}
                </div>
                <Textarea
                  value={activeScene.prompt}
                  onChange={(e) => updateScenePrompt(activeScene.id, e.target.value)}
                  placeholder="Enter the system prompt for this scene. Example: Answer the question using the screenshot and transcript."
                  className="w-full min-h-24 max-h-100 bg-white"
                  rows={6}
                />
              </div>
            )}
          </div>
        </div>

        {/* Add scene dialog */}
        <Dialog open={addSceneOpen} onOpenChange={setAddSceneOpen}>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle>Add Scene</DialogTitle>
              <DialogDescription>Create a scene with its own system prompt</DialogDescription>
            </DialogHeader>
            <Input
              value={newSceneName}
              onChange={(e) => setNewSceneName(e.target.value)}
              placeholder="Scene name, for example: Math Exam"
              maxLength={20}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddScene()
              }}
            />
            <DialogFooter>
              <Button variant="outline" onClick={() => setAddSceneOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddScene} disabled={!newSceneName.trim()}>
                Create
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete scene confirm dialog */}
        <Dialog open={!!sceneToDelete} onOpenChange={(open) => !open && setSceneToDelete(null)}>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle>Delete Scene</DialogTitle>
              <DialogDescription>
                Delete the “{deletingScene?.name}” scene and its prompt? This cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSceneToDelete(null)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  if (sceneToDelete) removeScene(sceneToDelete)
                  setSceneToDelete(null)
                }}
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Appearance Settings */}
        <div className="bg-gray-300/80 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <Palette className="h-5 w-5 mr-2" />
            Appearance Settings
          </h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">
                Window opacity
                <span className="ml-2 text-xs font-light">
                  Drag to preview, or adjust it with shortcuts on the main screen
                </span>
              </label>
              <div className="w-60 flex items-center gap-2">
                <span className="text-xs whitespace-nowrap">Transparent</span>
                <Slider
                  min={OPACITY_MIN}
                  max={OPACITY_MAX}
                  step={OPACITY_STEP}
                  value={[opacity]}
                  onValueChange={(value) => {
                    updateSetting('opacity', value[0])
                    document.body.style.opacity = value[0].toString()
                  }}
                />
                <span className="text-xs whitespace-nowrap">Opaque</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">
                Allow main window resizing
                <span className="ml-2 text-xs font-light">
                  When disabled, window edges no longer show resize cursors
                </span>
              </label>
              <Switch
                className="scale-y-90"
                checked={resizable}
                onCheckedChange={(checked) => updateSetting('resizable', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">
                Screenshot display
                <span className="ml-2 text-xs font-light">
                  Controls screenshot previews; screenshots are always sent to the AI
                </span>
              </label>
              <Select
                value={screenshotDisplay}
                onValueChange={(val) =>
                  updateSetting('screenshotDisplay', val as ScreenshotDisplay)
                }
              >
                <SelectTrigger className="w-60 bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Do not show</SelectItem>
                  <SelectItem value="count">Show screenshot count</SelectItem>
                  <SelectItem value="gallery">Show all thumbnails (default)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">
                Overlay toolbar
                <span className="ml-2 text-xs font-light">
                  Shows clickable action buttons above the main window; see Help for details
                </span>
              </label>
              <Switch
                className="scale-y-90"
                checked={showOverlayToolbar}
                onCheckedChange={(checked) => updateSetting('showOverlayToolbar', checked)}
              />
            </div>

            {showOverlayToolbar && (
              <div className="flex items-center justify-between pl-4 border-l-2 border-gray-400/70">
                <label className="text-sm font-medium">
                  Hover activation
                  <span className="ml-2 text-xs font-light">
                    Triggers an action after hovering; a progress bar shows the remaining time
                  </span>
                </label>
                <Select
                  value={String(toolbarHoverDelay)}
                  onValueChange={(val) => updateSetting('toolbarHoverDelay', Number(val))}
                >
                  <SelectTrigger className="w-60 bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Off (click only)</SelectItem>
                    <SelectItem value="500">Hover for 0.5 seconds</SelectItem>
                    <SelectItem value="1000">Hover for 1 second</SelectItem>
                    <SelectItem value="2000">Hover for 2 seconds</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </div>

        {/* Shortcuts Settings */}
        <div className="bg-gray-300/80 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <Keyboard className="h-5 w-5 mr-2" />
            Shortcut Settings
            <div className="text-sm font-light ml-2 mt-1">
              Most shortcuts only work on the main screen.
            </div>
            <ResetDefaultShortcuts />
          </h2>
          <CustomShortcuts />
        </div>

        {/* Screenshot Save Settings */}
        <div className="bg-gray-300/80 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <FolderOpen className="h-5 w-5 mr-2" />
            Save Screenshots
          </h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">
                Save screenshots locally
                <span className="ml-2 text-xs font-light">
                  Automatically saves every screenshot to the selected folder
                </span>
              </label>
              <Switch
                className="scale-y-90"
                checked={screenshotAutoSave}
                onCheckedChange={(checked) => updateSetting('screenshotAutoSave', checked)}
              />
            </div>
            {screenshotAutoSave && (
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">
                  Save folder
                  <span className="ml-2 text-xs font-light">
                    Click the path to choose another folder
                  </span>
                </label>
                <button
                  className="text-xs text-gray-600 max-w-48 truncate hover:text-gray-900 cursor-pointer transition-colors"
                  title="Choose screenshot folder"
                  onClick={async () => {
                    const dir = await window.api.selectScreenshotDir()
                    if (dir) updateSetting('screenshotDir', dir)
                  }}
                >
                  {screenshotDir || 'Default: Pictures/InterviewCoder'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Privacy Settings */}
        <div className="bg-gray-300/80 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            Privacy Settings
          </h2>

          <div className="space-y-4">
            <p className="text-sm">
              This app runs locally. Captured images are sent directly to the AI provider you
              configure. Review that provider&apos;s privacy policy before sending sensitive
              content.
            </p>
            {isMac && (
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">
                  Hide Dock icon
                  <span className="ml-2 text-xs font-light">
                    Hides the app from the Dock and Cmd+Tab; use the shortcut to show it again
                  </span>
                </label>
                <Switch
                  className="scale-y-90"
                  checked={hideDockIcon}
                  onCheckedChange={(checked) => updateSetting('hideDockIcon', checked)}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
