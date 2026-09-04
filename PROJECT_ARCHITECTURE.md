# Screenshot Assistant — Project Architecture

## 1. Purpose

Screenshot Assistant is an Electron desktop application that captures screen images, sends them to a vision-capable AI provider, and streams generated answers into a translucent always-on-top window. It supports continued conversations, follow-up questions, optional speech transcription, global shortcuts, and a separate overlay toolbar.

## 2. Technology

| Area                 | Technology                                          |
| -------------------- | --------------------------------------------------- |
| Desktop runtime      | Electron 37                                         |
| Build tooling        | electron-vite 4, Vite 7, electron-builder 25        |
| User interface       | React 19, TypeScript 5.8, Tailwind CSS 4, shadcn/ui |
| State management     | Zustand 5                                           |
| AI integration       | Vercel AI SDK and `@ai-sdk/openai`                  |
| Speech transcription | AssemblyAI Universal Streaming over WebSocket      |
| Routing              | React Router 7 with `HashRouter`                    |

## 3. Runtime process model

```text
┌──────────────────────────────────────────────────────────────┐
│ Electron main process                                        │
│                                                              │
│  index.ts ── application lifecycle                           │
│      │                                                       │
│      ├── main-window.ts ── main BrowserWindow                │
│      ├── toolbar-window.ts ── overlay BrowserWindow          │
│      ├── shortcuts.ts ── actions, screenshots, AI streams    │
│      ├── ai.ts ── OpenAI-compatible provider integration     │
│      ├── settings.ts / state.ts ── runtime state and IPC      │
│      ├── transcription.ts ── AssemblyAI streaming WebSocket  │
│      └── window-resize.ts ── custom frameless resizing       │
└──────────────────────────────┬───────────────────────────────┘
                               │ IPC
┌──────────────────────────────▼───────────────────────────────┐
│ Preload process: src/preload/index.ts                         │
│                                                              │
│ contextBridge exposes a typed window.api surface             │
└──────────────────────────────┬───────────────────────────────┘
                               │
┌──────────────────────────────▼───────────────────────────────┐
│ React renderer                                                │
│                                                              │
│ App.tsx ── routes and main/renderer settings synchronization │
│  ├── /          CoderPage                                    │
│  ├── /settings  SettingsPage                                 │
│  ├── /help      HelpPage                                     │
│  └── /toolbar   OverlayToolbar                               │
│                                                              │
│ Zustand stores hold settings, shortcuts, app state,          │
│ screenshots, streamed solution text, and transcription text. │
└──────────────────────────────────────────────────────────────┘
```

Electron's main process owns privileged operations. The renderer cannot directly capture screens, register global shortcuts, access application windows, or open the transcription WebSocket. It invokes those capabilities through the preload bridge.

## 4. Source layout

```text
src/
├── main/                         Electron main process
│   ├── index.ts                  Application startup and lifecycle
│   ├── main-window.ts            Main transparent window
│   ├── toolbar-window.ts         Separate overlay toolbar window
│   ├── shortcuts.ts              Global actions and stream orchestration
│   ├── ai.ts                     AI provider setup and streaming calls
│   ├── settings.ts               Runtime settings and settings IPC
│   ├── state.ts                  Runtime application state and IPC
│   ├── take-screenshot.ts        Screen capture
│   ├── save-screenshot.ts        Optional local screenshot persistence
│   ├── transcription.ts          AssemblyAI speech recognition
│   ├── window-resize.ts          Cursor-driven custom resizing
│   ├── auto-updater.ts           Windows update flow
│   └── index.d.ts                global.mainWindow declaration
├── preload/
│   ├── index.ts                  Safe window.api IPC bridge
│   └── index.d.ts                Renderer-facing API declarations
└── renderer/
    ├── index.html                Renderer document
    └── src/
        ├── main.tsx              React entry point
        ├── App.tsx               Router and global synchronization
        ├── coder/                Main screenshot and solution screen
        ├── settings/             Configuration screen
        ├── help/                 Help screen
        ├── components/           Shared React and shadcn components
        ├── lib/store/            Zustand stores and prompt scenes
        ├── lib/audio-capture.ts  Renderer audio capture
        ├── lib/toolbar-actions.ts Shared toolbar action definitions
        ├── lib/utils/            Environment and keyboard helpers
        └── assets/               Tailwind and application CSS
```

## 5. Main application flow

```text
Global shortcut or toolbar action
            │
            ▼
shortcuts.ts action callback
            │
            ├── capture screenshot
            ├── read and clear transcript
            ├── update conversationMessages
            └── send screenshot/loading events to renderer
                         │
                         ▼
                  ai.ts streamText()
                         │
                  streamed text chunks
                         │
                         ▼
             solution-chunk IPC events
                         │
                         ▼
       Zustand solution store → MarkdownRenderer
```

### New screenshot conversation

1. `takeScreenshot` is triggered by a registered global shortcut or toolbar action.
2. `src/main/take-screenshot.ts` captures the screen as a base64 PNG.
3. Any accumulated transcript is attached to the user message and then cleared.
4. `conversationMessages` is replaced with a new user message containing text and the image.
5. The renderer receives `solution-clear`, screenshot, and loading events.
6. `getSolutionStream()` creates an OpenAI-compatible provider and starts `streamText()`.
7. Each generated text chunk is sent to the renderer through `solution-chunk`.
8. Completion, cancellation, or error events update the renderer state.

### Additional screenshots

`appendScreenshot` adds another image message to the existing `conversationMessages` array. The main process retains the complete AI conversation while only keeping the five most recent images for thumbnail display.

### Follow-up questions

The renderer invokes `sendFollowUpQuestion`. The main process adds the question to the current conversation, streams another response, and preserves the result for subsequent turns.

## 6. AI provider configuration

`src/main/ai.ts` is the single AI integration point. It:

- Reads the latest runtime settings before every request.
- Trims API keys and removes an accidentally pasted `Bearer` prefix.
- Detects OpenRouter keys and normalizes the endpoint to `https://openrouter.ai/api/v1`.
- Sends an explicit Bearer authorization header.
- Uses the selected model or a provider-specific fallback.
- Applies the active scene's system prompt.
- Exposes separate streams for initial screenshots, appended screenshots, and follow-ups.

Configuration can originate from `.env` or the renderer settings. Renderer values are synchronized to the main process and take priority after initialization.

## 7. Renderer architecture

### Routes

| Route       | Component        | Responsibility                                               |
| ----------- | ---------------- | ------------------------------------------------------------ |
| `/`         | `CoderPage`      | Screenshots, solution stream, status controls, transcription |
| `/settings` | `SettingsPage`   | AI, prompts, audio, appearance, shortcuts, privacy           |
| `/help`     | `HelpPage`       | Usage instructions and shortcut reference                    |
| `/toolbar`  | `OverlayToolbar` | Compact controls in the second BrowserWindow                 |

### Main-screen components

- `AppHeader`: application name, version, Settings, Help, and Close controls.
- `AppContent`: screenshot gallery, errors, and streamed Markdown response.
- `AppStatusBar`: loading state, cancellation, follow-up input, and mouse status.
- `TranscriptionBar`: live or completed speech transcript.
- `PrerequisitesChecker`: first-run AI provider setup.

## 8. State management

| Store                   | Persistent | Main responsibility                                              |
| ----------------------- | ---------- | ---------------------------------------------------------------- |
| `useSettingsStore`      | Yes        | Provider, model, prompts, appearance, audio, screenshot settings |
| `useShortcutsStore`     | Yes        | Shortcut bindings and migration                                  |
| `useSolutionStore`      | No         | Loading, screenshots, generated chunks, errors                   |
| `useTranscriptionStore` | No         | Transcript, recording state, transcription errors                |
| `useAppStore`           | No         | Shared application state such as mouse passthrough               |

Persisted settings use local storage. Versioned migrations update existing installations when a stored setting changes meaning or shape. The current English-preset migration is version 9.

The toolbar is a separate renderer process and therefore has its own Zustand instances. Values it needs at runtime must be pushed through IPC rather than assumed to be shared in memory.

## 9. IPC boundary

### Renderer to main

- Settings: `getAppSettings`, `updateAppSettings`, `selectScreenshotDir`
- Application state: `updateAppState`
- Shortcuts: `initShortcuts`, `getShortcuts`, `updateShortcuts`
- AI actions: `stopSolutionStream`, `sendFollowUpQuestion`, `triggerAction`
- Toolbar: `setToolbarVisible`
- Resizing: `window-resize-start`, `window-resize-stop`
- Transcription: start, stop, audio chunks, get text, clear text

### Main to renderer

- State synchronization: `sync-app-state`, `sync-toolbar-settings`
- Screenshot state: `screenshot-taken`, `screenshots-updated`
- AI lifecycle: clear, loading start/end, chunks, complete, stopped, error
- Navigation: page up/down
- Opacity adjustment
- Transcription lifecycle: text, error, stopped, cleared, toggle

All renderer access to IPC should go through `window.api`, with declarations maintained in `src/preload/index.d.ts`.

## 10. Window behavior

The main and toolbar windows are frameless, transparent, always on top, omitted from the taskbar, and protected from screen capture. The native title is deliberately empty to reduce window-picker visibility.

Mouse passthrough allows interaction with applications behind the main window. The toolbar remains interactive and non-focusable. Both windows use custom resize handling because toggling Electron's native resizable frame can break transparency on Windows.

## 11. Stream cancellation

The main process stores one active `StreamContext` containing an `AbortController` and an abort reason:

- `user`: emit `solution-stopped`.
- `new-request`: cancel the old request silently before starting the new one.

Every stream path clears its context and loading state in `finally`, preventing stale requests from leaving the interface in a loading state.

## 12. Speech transcription

1. The renderer captures system or microphone audio.
2. Audio is converted to 16 kHz mono PCM16 chunks.
3. Chunks cross IPC to `src/main/transcription.ts`.
4. The main process streams them to AssemblyAI `universal-3-5-pro` over WebSocket.
5. Partial and final text return to the renderer.
6. The next screenshot attaches the accumulated transcript to the AI request and clears it.

Transcription uses a separate AssemblyAI API key; screenshot analysis keeps its configured AI provider.

## 13. Common extension points

### Add a setting

1. Add it to the main `settings` object.
2. Add it to the renderer `Settings` interface and defaults.
3. Add the control to `settings/index.tsx`.
4. Push it explicitly to the toolbar if that separate renderer needs it.
5. Increase the persisted version only if an existing value changes shape or meaning.

### Add a shortcut action

1. Add its default binding to the shortcut store.
2. Add its callback and validation in `main/shortcuts.ts`.
3. Extend the preload `triggerAction` type if the toolbar can invoke it.
4. Add its English label to `lib/toolbar-actions.ts` and shortcut settings/help.

### Add an AI scene

1. Add an English prompt file under `lib/store/prompts/`.
2. Import it into the settings store.
3. Add it to `PRESET_SCENE_PROMPTS` and `createPresetScenes()`.

## 14. Development commands

```bash
npm install
npm run dev
npm run typecheck
npm run lint
npm run build
npm run build:win
npm run build:mac
```

The root `tsconfig.json` only contains project references. Main and preload code use `tsconfig.node.json`; renderer code uses `tsconfig.web.json`.
