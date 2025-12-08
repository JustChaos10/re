# Getting Started with Re

This guide walks through using Re Generative UI with Google Vertex AI Gemini.

## Prerequisites

- Node.js 18+
- A Google Cloud project with Vertex AI enabled
- A service account JSON with access to Vertex AI (keep it private)

## Installation

```bash
npm install @re/core @re/react-ui
```

## Minimal Setup (server-side)

```tsx
import { useGenerateUI } from '@re/core';

function App() {
  const { components, generate, isLoading, error } = useGenerateUI({
    projectId: process.env.VERTEX_PROJECT_ID!,
    location: process.env.VERTEX_LOCATION,
    model: process.env.VERTEX_MODEL,
    credentials: JSON.parse(process.env.VERTEX_SERVICE_ACCOUNT_JSON!),
  });

  return (
    <div>
      <button onClick={() => generate('Show me a dashboard')} disabled={isLoading}>
        Generate
      </button>
      {error && <p>{error.message}</p>}
      <ReRenderer components={components} />
    </div>
  );
}
```

> Provide credentials only from server-side contexts (e.g., server components, API routes).

## Using the Chat Interface

```tsx
import { ReChat, ThemeProvider } from '@re/react-ui';

function App() {
  return (
    <ThemeProvider>
      <ReChat
        projectId={process.env.VERTEX_PROJECT_ID!}
        credentials={JSON.parse(process.env.VERTEX_SERVICE_ACCOUNT_JSON!)}
        placeholder="Ask me to create a UI..."
        onError={(error) => console.error(error)}
      />
    </ThemeProvider>
  );
}
```

## Using the Backend API (recommended for browsers)

1. Start the API server:
```bash
cd packages/api
# set VERTEX_SERVICE_ACCOUNT_PATH or VERTEX_SERVICE_ACCOUNT_JSON in .env
npm run dev
```

2. Call from your frontend:
```tsx
const response = await fetch('http://localhost:3001/api/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ prompt: 'Show me a dashboard' })
});

const { ui } = await response.json();
console.log(ui.components);
```

## Environment Variables

- `VERTEX_SERVICE_ACCOUNT_PATH` or `VERTEX_SERVICE_ACCOUNT_JSON`
- `VERTEX_PROJECT_ID` (optional if present in service account)
- `VERTEX_LOCATION` (default `asia-south1`)
- `VERTEX_MODEL` (default `gemini-3.0-pro-preview-001`)
- `PORT`, `ALLOWED_ORIGINS`, `NODE_ENV` (for the API server)

## Best Practices

- Keep service accounts out of git (`service.json` is ignored)
- Load credentials only on the server; never ship them to browsers
- Set CORS origins when exposing the API
- Handle errors gracefully in UI
- Experiment with prompts for best results

Happy building with Re!
