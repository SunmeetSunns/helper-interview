import { useSettingsStore } from '@/lib/store/settings'

let mediaStream: MediaStream | null = null
let audioContext: AudioContext | null = null
let processor: ScriptProcessorNode | null = null

function downsampleAndSend(float32: Float32Array): void {
  const int16 = new Int16Array(float32.length)
  for (let i = 0; i < float32.length; i++) {
    const s = Math.max(-1, Math.min(1, float32[i]))
    int16[i] = s < 0 ? s * 0x8000 : s * 0x7fff
  }
  window.api.sendTranscriptionAudioChunk(int16.buffer)
}

async function openMicrophoneStream(deviceId: string): Promise<MediaStream> {
  return navigator.mediaDevices.getUserMedia({
    audio: { deviceId: { exact: deviceId } },
    video: false
  })
}

async function openSystemAudioStream(): Promise<MediaStream> {
  const stream = await navigator.mediaDevices.getDisplayMedia({
    audio: true,
    video: true
  })
  stream.getVideoTracks().forEach((t) => t.stop())
  return stream
}

export async function startAudioCapture(): Promise<void> {
  const { audioInputDeviceId, audioOutputDeviceId } = useSettingsStore.getState()

  let stream: MediaStream
  if (audioInputDeviceId) {
    // Do not silently switch to system audio if the selected microphone fails.
    // That makes the UI appear active while the user's voice is not being captured.
    stream = await openMicrophoneStream(audioInputDeviceId)
  } else {
    stream = await openSystemAudioStream()
  }

  const audioTracks = stream.getAudioTracks()
  if (audioTracks.length === 0) {
    stream.getTracks().forEach((track) => track.stop())
    throw new Error('The selected audio source did not provide an audio track')
  }

  mediaStream = stream

  // AssemblyAI streaming accepts 16 kHz mono PCM16 audio.
  audioContext = new AudioContext({ sampleRate: 16000 })
  if (audioContext.state === 'suspended') {
    await audioContext.resume()
  }

  if (audioOutputDeviceId && 'setSinkId' in audioContext) {
    try {
      await (audioContext as AudioContext & { setSinkId: (id: string) => Promise<void> }).setSinkId(
        audioOutputDeviceId
      )
    } catch (err) {
      console.warn('Failed to set audio output device:', err)
    }
  }

  const source = audioContext.createMediaStreamSource(new MediaStream(audioTracks))

  processor = audioContext.createScriptProcessor(2048, 1, 1)
  processor.onaudioprocess = (e) => {
    downsampleAndSend(e.inputBuffer.getChannelData(0))
  }
  source.connect(processor)
  processor.connect(audioContext.destination)
}

export function stopAudioCapture(): void {
  if (processor) {
    processor.disconnect()
    processor = null
  }
  if (audioContext) {
    audioContext.close()
    audioContext = null
  }
  if (mediaStream) {
    mediaStream.getTracks().forEach((t) => t.stop())
    mediaStream = null
  }
}
