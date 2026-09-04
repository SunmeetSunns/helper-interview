# Screenshot Assistant / Coding Interview Assistant / Online Exam Assistant

![Usage demo](https://github.com/user-attachments/assets/19781594-3108-4711-a54b-9d36496787bc)

## Overview

Screenshot Assistant captures the screen with a keyboard shortcut and uses a vision-capable AI model to analyze questions and stream suggested answers. Its always-on-top window avoids taking focus and is protected from screen-sharing capture.

### Main features

- **Screenshot analysis:** Capture the screen, optionally include a live system-audio transcript, and stream the AI response.
- **Continuous conversations:** Add screenshots and ask follow-up questions while preserving context.
- **Prompt scenes:** Built-in scenes for coding problems, English exams, aptitude tests, and general questions, plus custom scenes.
- **Screen-capture protection:** Prevent supported screen-sharing software from capturing the assistant window.
- **Non-activating overlay:** Keep the translucent window visible without taking focus from the page underneath.

## Development

### 1. Install dependencies

Install [Node.js](https://nodejs.org/en/download) first, then run:

```bash
npm install
```

### 2. Start the application

```bash
npm run dev
```

### 3. Configure an AI provider

Open **Settings** and enter an `API Base URL`, `API Key`, and supported vision model. The application supports OpenAI and OpenAI-compatible providers such as [OpenRouter](https://openrouter.ai/) and [SiliconFlow](https://cloud.siliconflow.cn/i/SG8C0772).

For OpenRouter, use:

```env
API_BASE_URL="https://openrouter.ai/api/v1"
API_KEY="sk-or-v1-your-key"
MODEL="provider/model-name"
```

You can place these values in a `.env` file at the project root or configure them in the application. Values entered in the application take priority.

### 4. Configure speech transcription (optional)

Speech transcription converts system audio or microphone input to text and submits it with the next screenshot. It uses AssemblyAI Universal Streaming and requires a separate AssemblyAI API key.

1. Create an AssemblyAI account and copy its API key.
2. Enter the key under **Settings → Speech Transcription**.
3. Select the microphone or system-audio source.
4. Use the transcription shortcut to start or pause transcription.

## Screen-capture protection

Protection behavior varies by operating system, browser, and meeting application. Test the exact computer and conferencing software before relying on it. See the project [Wiki](https://github.com/ooboqoo/interview-coder-cn/wiki) for additional guidance.

## License

This project is licensed under [CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/). Commercial use is prohibited without written permission from the author.

## Related projects

- https://github.com/ibttf/interview-coder
- https://github.com/sohzm/cheating-daddy
- https://github.com/pickle-com/glass
- https://github.com/j4wg/interview-coder-withoupaywall-opensource
