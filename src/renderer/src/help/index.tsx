import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import {
  ArrowLeft,
  Lightbulb,
  MessageCircle,
  Camera,
  PictureInPicture2,
  EyeOff,
  Info
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import ShortcutRenderer from '@/components/ShortcutRenderer'
import { platformAlt } from '@/lib/utils/env'
import { HelpSection } from './components'
import { Shortcuts } from './Shortcuts'
import { OverlayToolbarHelp } from './OverlayToolbar'
import { FAQ } from './FAQ'

export default function HelpPage() {
  const [appVersion, setAppVersion] = useState('')

  useEffect(() => {
    window.api.getAppVersion().then(setAppVersion)
  }, [])

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
        <h1>Help Center</h1>
      </div>

      {/* Help Content */}
      <div id="app-content" className="flex flex-col gap-4 p-8">
        {/* Introduction */}
        <HelpSection
          Icon={Info}
          title="Introduction"
          description={appVersion && `Version ${appVersion}`}
        >
          <p className="text-gray-700">
            Welcome to Screenshot Assistant. It captures your screen, analyzes its contents, and
            suggests answers for coding problems, exams, and other question types. Visit the{' '}
            <a
              href="https://github.com/ooboqoo/interview-coder-cn/wiki"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-blue-600 hover:underline"
            >
              GitHub Wiki
            </a>{' '}
            for setup help, screen-capture protection, and API key instructions.
          </p>
          <div className="bg-gray-700/10 rounded-lg p-4">
            <h3 className="font-semibold mb-2">Main features:</h3>
            <ul className="space-y-1 text-gray-700 list-disc list-inside">
              <li className="flex gap-2">
                <Camera className="h-6 w-4" />
                <span>Capture screenshots with shortcuts and generate suggested solutions.</span>
              </li>
              <li className="flex gap-2">
                <EyeOff className="h-6 w-4" />
                <span>
                  Protect the app window from screen capture. Some meeting apps may need additional
                  configuration.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <PictureInPicture2 className="h-6 w-4" />
                <span>
                  Keep a translucent window on top without taking focus from the page underneath.
                </span>
              </li>
            </ul>
          </div>
        </HelpSection>

        {/* Quick Start */}
        <HelpSection Icon={Lightbulb} title="Quick Start">
          <div className="border border-gray-400 rounded-lg p-4">
            <h3 className="font-semibold mb-2">1. Capture the screen</h3>
            <p className="text-sm text-gray-700">
              When you want to analyze a question, press{' '}
              <ShortcutRenderer shortcut={`${platformAlt}+Enter`} className="text-xs mx-1" />
              to capture the current screen. The screenshot appears immediately.
            </p>
          </div>
          <div className="border border-gray-400 rounded-lg p-4">
            <h3 className="font-semibold mb-2">2. Review the result</h3>
            <p className="text-sm text-gray-700">
              The selected scene prompt analyzes the screenshot and generates an answer.
            </p>
          </div>
        </HelpSection>

        {/* Keyboard Shortcuts */}
        <Shortcuts />

        {/* Overlay Toolbar */}
        <OverlayToolbarHelp />

        {/* FAQ */}
        <FAQ />

        {/* Contact Support */}
        <HelpSection Icon={MessageCircle} title="Support">
          <p className="text-gray-700">For problems or suggestions, contact us here:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="border border-gray-400 rounded-lg p-4">
              <h3 className="font-semibold mb-2 ">GitHub Issues</h3>
              <p className="text-gray-700">
                Submit bug reports and feature requests through{' '}
                <a
                  href="https://github.com/ooboqoo/interview-coder-cn/issues"
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  GitHub Issues
                </a>{' '}
                .
              </p>
            </div>
          </div>
        </HelpSection>
      </div>
    </>
  )
}
