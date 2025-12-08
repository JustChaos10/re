# Re Architecture

This document outlines how Re Generative UI works with Google Vertex AI Gemini.

## Overview

Re is a modular framework for generating desktop-first UI. The flow:

```
User prompt
   ↓
GeminiClient (Vertex AI)
   ↓ JSON spec
React hooks / ReChat
   ↓
@re/react-ui renderers
   ↓
Rendered UI
```

## Core Packages

### @re/core
- `GeminiClient` — Vertex AI client (service account auth)
- Hooks: `useGenerateUI`, `useChat`
- Types, schemas, validation, summarization utilities

### @re/react-ui
- `ComponentRenderer` and 16+ UI components
- `ThemeProvider`, `ReChat` UI shell

### @re/api
- Express server that proxies to `GeminiClient`
- SSE streaming endpoints + OpenAI-compatible `/v1/chat/completions`

## Data Flow

1) Prompt → LLM  
`GeminiClient.generateUI()` sends the system prompt + user prompt to Vertex AI with `responseMimeType: application/json`.

2) JSON → Components  
Response is validated against `uiResponseSchema` and normalized into component specs.

3) Components → UI  
Hooks expose state; `ComponentRenderer` maps specs to React components; optional theming via `ThemeProvider`.

## Streaming

`GeminiClient.streamUI()` aggregates streamed JSON and emits:
- `components` chunks
- `metadata`
- `done`

API routes forward these as Server-Sent Events.

## Credentials & Security

- Service account JSON loaded from env (`VERTEX_SERVICE_ACCOUNT_PATH` / `VERTEX_SERVICE_ACCOUNT_JSON`)
- `service.json` is gitignored
- Use the API server for browsers; keep credentials server-side
- CORS origin allowlist + 1 MB body limit + sanitized errors

## Component Schema

```ts
{
  id: string;
  type: ComponentType;
  props: Record<string, any>;
  children?: Component[];
  metadata?: Record<string, any>;
}
```

## Extensibility

1. Add a type to `packages/core/src/types/components.ts`  
2. Implement the component in `packages/react-ui`  
3. Register in `ComponentRenderer`  
4. Update the system prompt to mention the new type

## Notes

- Vertex AI SDK is Node-focused; keep LLM calls on the server
- The demo stores credentials locally for development only—do not deploy that pattern
