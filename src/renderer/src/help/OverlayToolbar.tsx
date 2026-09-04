import { PanelTop } from 'lucide-react'
import ShortcutRenderer from '@/components/ShortcutRenderer'
import { useShortcutsStore } from '@/lib/store/shortcuts'
import { TOOLBAR_ACTIONS } from '@/lib/toolbar-actions'
import { HelpSection } from './components'

export function OverlayToolbarHelp() {
  const { shortcuts } = useShortcutsStore()

  return (
    <HelpSection
      Icon={PanelTop}
      title="Overlay Toolbar"
      description="Use clickable buttons instead of keyboard shortcuts"
    >
      <p className="text-gray-700">
        The toolbar stays above the main window, follows it when moved or hidden, and uses the same
        opacity. Like the main window, it is protected from screen capture. Use it when shortcuts
        conflict with other software or when you prefer mouse controls.
      </p>
      <div className="overlay-toolbar w-fit">
        {TOOLBAR_ACTIONS.map(({ action, Icon }) => (
          <div key={action} className="flex size-7 items-center justify-center">
            <Icon className="size-4" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {TOOLBAR_ACTIONS.map(({ action, Icon, label }) => (
          <div
            key={action}
            className="flex items-center gap-2 rounded border border-gray-400 px-2 py-1"
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span className="text-sm">{label}</span>
            {shortcuts[action] && (
              <ShortcutRenderer shortcut={shortcuts[action].key} className="ml-auto select-none" />
            )}
          </div>
        ))}
      </div>
      <ul className="space-y-1 text-sm text-gray-700 list-disc list-inside">
        <li>Clicking a button does not take focus away from the page underneath.</li>
        <li>The toolbar remains clickable while mouse passthrough is enabled.</li>
        <li>
          Settings → Appearance Settings → Hover activation can trigger buttons without a click.
          Moving away cancels the progress; move away and back to trigger the same action again.
        </li>
        <li>
          Drag the toolbar&apos;s left or right edge to resize its width. Buttons keep their size,
          and buttons that no longer fit are hidden from the right.
        </li>
        <li>
          The hide/show action remains shortcut-only because the toolbar hides with the window.
        </li>
        <li>Disable the toolbar under Settings → Appearance Settings → Overlay toolbar.</li>
      </ul>
    </HelpSection>
  )
}
