# @re/core

Core framework for Re Generative UI with Google Vertex AI Gemini client and React hooks.

## Installation

```bash
npm install @re/core
```

## Features

- Gemini (Vertex AI) client with streaming support
- React hooks for UI generation and chat-style flows
- Full TypeScript definitions
- Streaming and non-streaming modes

## Usage

### Direct API Usage (server-side)

```typescript
import { GeminiClient } from '@re/core';

const client = new GeminiClient({
  projectId: process.env.VERTEX_PROJECT_ID!,
  location: process.env.VERTEX_LOCATION,
  model: process.env.VERTEX_MODEL,
  // Provide either credentials or keyFilename; do not expose to browsers
  credentials: JSON.parse(process.env.VERTEX_SERVICE_ACCOUNT_JSON!),
});

const response = await client.generateUI({
  prompt: 'Show me a sales dashboard',
});

console.log(response.ui.components);
```

### React Hooks

Hooks wrap the same client. They expect server-side execution (do not bundle service account keys into a browser).

```tsx
import { useGenerateUI } from '@re/core';

function MyComponent() {
  const { components, generate, isLoading } = useGenerateUI({
    projectId: process.env.VERTEX_PROJECT_ID!,
    credentials: JSON.parse(process.env.VERTEX_SERVICE_ACCOUNT_JSON!),
  });

  return (
    <button onClick={() => generate('Create a form')} disabled={isLoading}>
      Generate
    </button>
  );
}
```

### Streaming

```typescript
// With async generator
for await (const chunk of client.streamUI({ prompt: 'Show data' })) {
  console.log(chunk);
}

// With callbacks
await client.generateUIWithCallbacks(
  { prompt: 'Show data' },
  {
    onComponent: (components) => console.log(components),
    onMetadata: (metadata) => console.log(metadata),
    onDone: () => console.log('Done!'),
  }
);
```

## License

MIT
