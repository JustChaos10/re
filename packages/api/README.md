# @re/api

Backend API server for Re Generative UI with streaming support.

## Installation

```bash
cd packages/api
npm install
```

## Configuration

```bash
cp .env.example .env
# Edit .env and add your GROQ_API_KEY
```

## Running

```bash
# Development
npm run dev

# Production
npm run build
npm start
```

The server runs on `http://localhost:3001` by default.

## Endpoints

### POST /api/generate

Generate UI (non-streaming)

**Request:**
```json
{
  "prompt": "Show me a dashboard",
  "model": "llama-3.1-70b-versatile",
  "temperature": 0.7,
  "maxTokens": 4096
}
```

**Response:**
```json
{
  "ui": {
    "components": [...],
    "metadata": {...}
  },
  "model": "llama-3.1-70b-versatile",
  "usage": {
    "promptTokens": 100,
    "completionTokens": 200,
    "totalTokens": 300
  }
}
```

### POST /api/generate/stream

Generate UI (streaming with Server-Sent Events)

**Request:** Same as above

**Response:** SSE stream with events:
```
data: {"type":"components","data":[...]}
data: {"type":"metadata","data":{...}}
data: {"type":"done"}
```

### POST /v1/chat/completions

OpenAI-compatible endpoint

**Request:**
```json
{
  "messages": [
    {"role": "user", "content": "Show me a dashboard"}
  ],
  "model": "llama-3.1-70b-versatile",
  "stream": false
}
```

## Usage with Frontend

```tsx
// Use with fetch
const response = await fetch('http://localhost:3001/api/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    prompt: 'Show me a dashboard',
    apiKey: 'your-groq-api-key'
  })
});

const data = await response.json();
```

## Environment Variables

- `GROQ_API_KEY` - Your Groq API key (required)
- `PORT` - Server port (default: 3001)

## License

MIT
