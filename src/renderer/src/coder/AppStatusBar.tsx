import { useState } from 'react'
import { Pointer, PointerOff, OctagonX, MessageCircle, Trash2 } from 'lucide-react'
import { useSolutionStore } from '@/lib/store/solution'
import { useShortcutsStore } from '@/lib/store/shortcuts'
import { useAppStore } from '@/lib/store/app'
import { useTranscriptionStore } from '@/lib/store/transcription'
import ShortcutRenderer from '@/components/ShortcutRenderer'
import { Button } from '@/components/ui/button'
import { Dialog, DialogTitle, DialogContent, DialogFooter } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'

export function AppStatusBar() {
  const {
    isLoading: isReceivingSolution,
    setIsLoading,
    screenshotData,
    solutionChunks
  } = useSolutionStore()
  const { ignoreMouse } = useAppStore()
  const { isTranscribing, transcriptionText } = useTranscriptionStore()
  const { shortcuts } = useShortcutsStore()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isClearDialogOpen, setIsClearDialogOpen] = useState(false)
  const [questionInput, setQuestionInput] = useState('')

  const handleStop = () => {
    setIsLoading(false)
    void window.api.stopSolutionStream()
  }

  const handleFollowUpClick = () => {
    setIsDialogOpen(true)
  }

  const handleDialogClose = () => {
    setIsDialogOpen(false)
    setQuestionInput('')
  }

  const handleSubmitQuestion = async () => {
    if (!questionInput.trim()) return

    setIsLoading(true)
    setIsDialogOpen(false)
    const question = questionInput.trim()
    setQuestionInput('')

    try {
      await window.api.sendFollowUpQuestion(question)
    } catch (error) {
      console.error('Error sending follow-up question:', error)
      setIsLoading(false)
    }
  }

  // Check if there's an active conversation
  const hasActiveConversation = screenshotData && solutionChunks.length > 0
  const hasSessionData = Boolean(
    screenshotData || solutionChunks.length || transcriptionText || isTranscribing
  )

  const handleClearSession = async () => {
    await window.api.triggerAction('clearSession')
    setIsClearDialogOpen(false)
    setIsDialogOpen(false)
    setQuestionInput('')
  }

  return (
    <div className="absolute bottom-0 flex items-center justify-between w-full text-blue-100 bg-gray-600/10 px-4 pb-1">
      <div>
        {isReceivingSolution ? (
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-r-2 border-[currentColor]"></div>
            <span className="text-sm">Generating...</span>
            <div className="fixed bottom-4 left-1/2 -translate-x-1/2 flex justify-center z-50 pointer-events-none">
              <Button
                variant="secondary"
                className="h-8 px-4 text-base shadow-lg pointer-events-auto"
                onClick={handleStop}
              >
                <OctagonX className="w-4 h-4" />
                Stop generating
                <ShortcutRenderer
                  shortcut={shortcuts.stopSolutionStream.key}
                  className="inline-block border bg-transparent py-0 px-1"
                />
              </Button>
            </div>
          </div>
        ) : hasActiveConversation ? (
          <div className="flex items-center space-x-2 pointer-events-none opacity-50 text-sm gap-1">
            <span>
              <ShortcutRenderer
                shortcut={shortcuts.appendScreenshot.key}
                className="inline-block scale-75 text-xs border border-current bg-transparent py-0 px-1 ml-1"
              />
              Add screenshot
            </span>
            <span>
              <ShortcutRenderer
                shortcut={shortcuts.takeScreenshot.key}
                className="inline-block scale-75 text-xs border border-current bg-transparent py-0 px-1"
              />
              New conversation
            </span>
          </div>
        ) : null}
      </div>
      <div className="flex items-center space-x-4 select-none">
        {hasSessionData && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsClearDialogOpen(true)}
            className="h-7 px-3 text-xs"
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Clear session
          </Button>
        )}
        {/* Follow-up Question Button */}
        {hasActiveConversation && !isReceivingSolution && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleFollowUpClick}
            className="h-7 px-3 text-xs"
            disabled={isReceivingSolution}
          >
            <MessageCircle className="w-4 h-4 mr-1" />
            Ask a follow-up
          </Button>
        )}
        {/* Mouse Status Indicator */}
        <div className="flex items-center">
          {ignoreMouse ? (
            <>
              <PointerOff className="w-4 h-4 mr-2" />
              <span className="text-xs">
                Disable mouse passthrough
                <ShortcutRenderer
                  shortcut={shortcuts.ignoreOrEnableMouse.key}
                  className="inline-block scale-75 text-xs border border-current bg-transparent py-0 px-1"
                />
              </span>
            </>
          ) : (
            <Pointer className="w-4 h-4" />
          )}
        </div>
      </div>

      {/* Follow-up Question Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTitle className="sr-only">Ask a follow-up</DialogTitle>
        <DialogContent>
          <div className="py-4">
            <Textarea
              placeholder="Enter a follow-up question. Press Ctrl+Enter to submit..."
              value={questionInput}
              className="min-h-24"
              onChange={(e) => setQuestionInput(e.target.value)}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                  e.preventDefault()
                  handleSubmitQuestion()
                }
              }}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleDialogClose}>
              Cancel
            </Button>
            <Button onClick={handleSubmitQuestion} disabled={!questionInput.trim()}>
              Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isClearDialogOpen} onOpenChange={setIsClearDialogOpen}>
        <DialogContent>
          <DialogTitle>Clear session data?</DialogTitle>
          <p className="py-4 text-sm text-muted-foreground">
            This clears the current screenshots, transcript, generated answer, and AI conversation
            history. Your API keys and settings will be kept.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsClearDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleClearSession}>
              Clear session
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
