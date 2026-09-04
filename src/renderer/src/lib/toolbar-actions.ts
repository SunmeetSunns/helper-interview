import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Camera,
  ChevronDown,
  ChevronUp,
  CircleStop,
  ImagePlus,
  Mic,
  MousePointer2,
  Sun,
  SunDim,
  type LucideIcon
} from 'lucide-react'

/** Action names the main process accepts from a toolbar click */
export type ToolbarActionName = Parameters<Window['api']['triggerAction']>[0]

export type ToolbarAction = {
  /** Also the shortcut action name, so the same key binding can be shown in help */
  action: ToolbarActionName
  Icon: LucideIcon
  label: string
}

/**
 * Buttons of the overlay toolbar, in display order. Drives both the toolbar
 * itself and its description on the help page, so the two never drift apart.
 * `hideOrShowMainWindow` is intentionally absent: hiding the window also hides
 * the toolbar, leaving no way to click the window back.
 */
export const TOOLBAR_ACTIONS: ToolbarAction[] = [
  { action: 'takeScreenshot', Icon: Camera, label: 'Solve screenshot (new conversation)' },
  { action: 'appendScreenshot', Icon: ImagePlus, label: 'Add screenshot' },
  { action: 'stopSolutionStream', Icon: CircleStop, label: 'Stop generating' },
  { action: 'ignoreOrEnableMouse', Icon: MousePointer2, label: 'Toggle mouse passthrough' },
  { action: 'pageUp', Icon: ChevronUp, label: 'Page up' },
  { action: 'pageDown', Icon: ChevronDown, label: 'Page down' },
  { action: 'moveMainWindowUp', Icon: ArrowUp, label: 'Move window up' },
  { action: 'moveMainWindowLeft', Icon: ArrowLeft, label: 'Move window left' },
  { action: 'moveMainWindowDown', Icon: ArrowDown, label: 'Move window down' },
  { action: 'moveMainWindowRight', Icon: ArrowRight, label: 'Move window right' },
  { action: 'increaseOpacity', Icon: Sun, label: 'Increase opacity' },
  { action: 'decreaseOpacity', Icon: SunDim, label: 'Decrease opacity' },
  { action: 'toggleTranscription', Icon: Mic, label: 'Start or pause transcription' }
]
