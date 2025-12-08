# @re/api

Backend API server for Re Generative UI with streaming support using Google Vertex AI Gemini.

## Installation

```bash
cd packages/api
npm install
```

## Configuration

- `VERTEX_SERVICE_ACCOUNT_PATH` (recommended): path to your service account JSON (gitignored by default)
- `VERTEX_SERVICE_ACCOUNT_JSON` (optional): inline JSON credentials from a secrets manager
- `VERTEX_PROJECT_ID` (optional): falls back to the service account `project_id`
- `VERTEX_LOCATION` (optional): Vertex AI region, default `asia-south1`
- `VERTEX_MODEL` (optional): Gemini model id, default `gemini-3.0-pro-preview-001`
- `PORT` (optional): server port, default `3001`
- `NODE_ENV` (optional): `development`/`production`
- `ALLOWED_ORIGINS` (optional): comma-separated CORS origins, default `http://localhost:3000,http://localhost:5173`

## Running

```bash
# Development
npm run dev

# Production
npm run build
npm start
```

The server runs on `http://localhost:3001` by default.

## Security Features

- Service account credentials loaded only from server-side env/path; `service.json` is gitignored
- CORS origin whitelist
- 1 MB request size limit
- Error sanitization (generic messages in production)
- Input validation (temperature 0-2, maxTokens 1-8192, prompt max 10k chars)

## Endpoints

### GET /health
Simple health check.

### POST /api/generate
Non-streaming UI generation.

**Headers:** `Content-Type: application/json`

**Body:**
```json
{
  "prompt": "Show me a dashboard",
  "model": "gemini-3.0-pro-preview-001",
  "temperature": 0.7,
  "maxTokens": 4096
}
```

### POST /api/generate/stream
Streaming UI generation via Server-Sent Events.

**Headers:** `Content-Type: application/json`

**Body:** Same as `/api/generate`

**Events:**
```
data: {"type":"components","data":[...]}
data: {"type":"metadata","data":{...}}
data: {"type":"done"}
```

### POST /v1/chat/completions
OpenAI-compatible interface. The last user message is used as the prompt; prior messages are passed as context. Set `stream: true` for SSE streaming.

## Usage Example

```typescript
const response = await fetch('http://localhost:3001/api/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    prompt: 'Show me a dashboard',
    temperature: 0.5,
    model: 'gemini-3.0-pro-preview-001'
  })
});

const data = await response.json();
console.log(data.ui);
```

## Production Notes

- Keep the service account JSON out of git (path is ignored by default)
- Use `VERTEX_SERVICE_ACCOUNT_PATH` or `VERTEX_SERVICE_ACCOUNT_JSON` from a secrets manager
- Set `ALLOWED_ORIGINS` to your production domains
- Run behind HTTPS and consider rate limiting if exposed publicly

## License

MIT
