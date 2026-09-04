import { BookOpen } from 'lucide-react'
import ShortcutRenderer from '@/components/ShortcutRenderer'
import { platformAlt } from '@/lib/utils/env'
import { HelpSection } from './components'

const faqs = [
  {
    question: 'How do I take a screenshot?',
    answer: (
      <span>
        Press
        <ShortcutRenderer shortcut={`${platformAlt}+Enter`} className="text-xs mx-1" />
        to capture the current screen. The screenshot appears in the app automatically.
      </span>
    )
  },
  {
    question: 'What if a problem spans more than one screen?',
    answer: (
      <span>
        Press
        <ShortcutRenderer shortcut={`${platformAlt}+Shift+Enter`} className="text-xs mx-1" />
        to add another screenshot to the current conversation.
      </span>
    )
  },
  {
    question: 'Can other people see the app while I share my screen?',
    answer: (
      <span>
        The app window is protected from screen capture, but some meeting software may require
        additional configuration. Test your computer and meeting software before relying on this
        behavior. See the{' '}
        <a
          href="https://github.com/ooboqoo/interview-coder-cn/wiki"
          target="_blank"
          rel="noreferrer"
          className="text-blue-600 hover:underline"
        >
          GitHub Wiki
        </a>{' '}
        for details.
      </span>
    )
  },
  {
    question: 'Does the pointer change when it moves over the window?',
    answer: (
      <span>
        You can enable mouse passthrough so clicks reach the content behind the window. Use{' '}
        <ShortcutRenderer shortcut={`${platformAlt}+M`} className="text-xs" /> to toggle it. The
        current status appears in the lower-right corner.
      </span>
    )
  },
  {
    question: 'Can I use the mouse instead of shortcuts?',
    answer: (
      <span>
        Yes. The overlay toolbar provides buttons for common actions without taking focus from the
        page underneath. Enable it under Settings → Appearance Settings → Overlay toolbar.
      </span>
    )
  },
  {
    question: 'What is speech transcription and how do I use it?',
    answer: (
      <span>
        Transcription converts speech or spoken questions into text so the AI has more context.
        Configure an AssemblyAI API key under Speech Transcription in Settings, then press
        <ShortcutRenderer shortcut={`${platformAlt}+T`} className="text-xs mx-1" />
        to start or pause. The transcript is submitted with the next screenshot.
      </span>
    )
  },
  {
    question: 'Can I clear the transcript separately?',
    answer: (
      <span>
        Yes. Press
        <ShortcutRenderer shortcut={`${platformAlt}+Shift+T`} className="text-xs mx-1" />
        to clear it without submitting it. Existing transcript text is also cleared after a
        screenshot is taken.
      </span>
    )
  }
]

export function FAQ() {
  return (
    <HelpSection Icon={BookOpen} title="Frequently Asked Questions">
      {faqs.map((faq, index) => (
        <div key={index} className="border border-gray-400 rounded-lg p-4">
          <h3 className="font-semibold mb-2">{faq.question}</h3>
          <p className="text-sm text-gray-700">{faq.answer}</p>
        </div>
      ))}
    </HelpSection>
  )
}
