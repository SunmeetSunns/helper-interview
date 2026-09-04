import { Keyboard } from 'lucide-react'
import { useShortcutsStore } from '@/lib/store/shortcuts'
import ShortcutRenderer from '@/components/ShortcutRenderer'
import { HelpSection } from './components'

export function Shortcuts() {
  return (
    <HelpSection
      Icon={Keyboard}
      title="Keyboard Shortcuts"
      description="Shortcuts are the primary way to control the app and can be customized in Settings."
    >
      <ShortcutItemGroup category="Window Management" />
      <ShortcutItemGroup category="Screenshot & AI" />
      <ShortcutItemGroup category="Navigation" />
      <ShortcutItemGroup category="Window Movement" />
    </HelpSection>
  )
}

function ShortcutItemGroup({ category }: { category: string }) {
  const { shortcuts } = useShortcutsStore()
  return (
    <div className="space-y-2">
      <h3 className="text-sm text-gray-500">{getCategoryName(category)}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.values(shortcuts)
          .filter((shortcut) => shortcut.category === category)
          .map((shortcut, index) => (
            <ShortcutItem key={index} action={shortcut.action} shortcutKey={shortcut.key} />
          ))}
      </div>
    </div>
  )
}

function ShortcutItem({ action, shortcutKey }: { action: string; shortcutKey: string }) {
  return (
    <div className="flex items-center justify-between rounded border border-gray-400 px-2 py-1">
      <span className="text-sm">{getShortcutDescription(action)}</span>
      <ShortcutRenderer shortcut={shortcutKey} className="select-none" />
    </div>
  )
}

const getCategoryName = (category: string) => {
  const categoryMap: Record<string, string> = {
    'Window Management': 'Window Management',
    'Screenshot & AI': 'Screenshot & AI',
    Navigation: 'Navigation',
    'Window Movement': 'Window Movement'
  }
  return categoryMap[category] || category
}

const getShortcutDescription = (action: string) => {
  const descriptionMap: Record<string, string> = {
    hideOrShowMainWindow: 'Hide/show window',
    ignoreOrEnableMouse: 'Toggle mouse passthrough',
    increaseOpacity: 'Increase opacity',
    decreaseOpacity: 'Decrease opacity',
    takeScreenshot: 'Take screenshot and start a new conversation',
    appendScreenshot: 'Add screenshot to the conversation',
    stopSolutionStream: 'Stop generating',
    toggleTranscription: 'Start/pause real-time transcription',
    clearTranscription: 'Clear transcript without submitting it',
    clearSession: 'Clear all current session data',
    pageUp: 'Page up',
    pageDown: 'Page down',
    moveMainWindowUp: 'Move window up',
    moveMainWindowDown: 'Move window down',
    moveMainWindowLeft: 'Move window left',
    moveMainWindowRight: 'Move window right'
  }
  return descriptionMap[action] || action
}
