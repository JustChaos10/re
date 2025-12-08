import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { GeminiClient, ServiceAccountCredentials } from '@re/core';
import { logError, logInfo } from './logger';

// Load .env from project root (3 levels up from packages/api/src)
const envPaths = [
  path.resolve(process.cwd(), '.env'),
  path.resolve(__dirname, '..', '.env'),
  path.resolve(__dirname, '../..', '.env'),
  path.resolve(__dirname, '../../..', '.env'),
];
for (const envPath of envPaths) {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
    console.log(`[Config] Loaded .env from: ${envPath}`);
    break;
  }
}

const app = express();
const PORT = process.env.PORT || 3001;
// Use GA Gemini 2.5 Pro for better structured JSON output quality
const DEFAULT_LOCATION = process.env.VERTEX_LOCATION || 'us-central1';
const DEFAULT_MODEL = process.env.VERTEX_MODEL || 'gemini-2.5-pro';

const LOG_PATH =
  process.env.API_LOG_PATH ||
  path.resolve(process.cwd(), 'logs', 're-api.log');

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:5176'];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      // In development, allow any localhost origin
      if (process.env.NODE_ENV !== 'production' && origin?.startsWith('http://localhost:')) {
        callback(null, true);
      } else if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '1mb' }));

function loadServiceAccount(): ServiceAccountCredentials {
  const inline = process.env.VERTEX_SERVICE_ACCOUNT_JSON;
  if (inline) {
    return JSON.parse(inline);
  }

  const candidatePath =
    process.env.VERTEX_SERVICE_ACCOUNT_PATH ||
    process.env.GOOGLE_APPLICATION_CREDENTIALS ||
    'service.json';

  const searchPaths = [
    candidatePath,
    path.resolve(process.cwd(), candidatePath),
    path.resolve(__dirname, '..', candidatePath),
    path.resolve(__dirname, '../..', candidatePath),
    path.resolve(__dirname, '../../..', candidatePath),
  ];

  for (const p of searchPaths) {
    if (p && fs.existsSync(p)) {
      const raw = fs.readFileSync(p, 'utf-8');
      return JSON.parse(raw);
    }
  }

  throw new Error(
    'Vertex AI credentials not found. Set VERTEX_SERVICE_ACCOUNT_JSON or VERTEX_SERVICE_ACCOUNT_PATH / GOOGLE_APPLICATION_CREDENTIALS.'
  );
}

function buildGeminiClient() {
  const credentials = loadServiceAccount();
  const projectId = process.env.VERTEX_PROJECT_ID || credentials.project_id;
  if (!projectId) {
    throw new Error(
      'Vertex AI project id missing. Set VERTEX_PROJECT_ID or include project_id in the service account json.'
    );
  }

  return new GeminiClient({
    projectId,
    location: DEFAULT_LOCATION,
    model: DEFAULT_MODEL,
    credentials,
  });
}

let geminiClient: GeminiClient;
try {
  console.log(`[Config] Using model: ${DEFAULT_MODEL}`);
  console.log(`[Config] Using location: ${DEFAULT_LOCATION}`);
  console.log(`[Config] PORT: ${PORT}`);
  geminiClient = buildGeminiClient();
} catch (error) {
  logError('Failed to initialize Vertex AI client', error);
  process.exit(1);
}

function sanitizeError(error: unknown): string {
  const message =
    error instanceof Error ? error.message : typeof error === 'string' ? error : 'An unexpected error occurred';

  // Log full details to file, not stdout.
  logError(message, error);

  if (process.env.NODE_ENV === 'production') {
    return 'An error occurred while processing your request';
  }

  return message;
}

function validateGenerateParams(params: {
  temperature?: number;
  maxTokens?: number;
}): { valid: boolean; error?: string } {
  if (params.temperature !== undefined) {
    if (typeof params.temperature !== 'number' || params.temperature < 0 || params.temperature > 2) {
      return { valid: false, error: 'Temperature must be a number between 0 and 2' };
    }
  }

  if (params.maxTokens !== undefined) {
    if (typeof params.maxTokens !== 'number' || params.maxTokens < 1 || params.maxTokens > 16384) {
      return { valid: false, error: 'maxTokens must be a number between 1 and 16384' };
    }
  }

  return { valid: true };
}

app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.post('/api/generate', async (req: Request, res: Response) => {
  try {
    const { prompt, model, temperature, maxTokens } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Valid prompt is required' });
    }

    if (prompt.length > 10000) {
      return res.status(400).json({ error: 'Prompt too long (max 10000 characters)' });
    }

    const validation = validateGenerateParams({ temperature, maxTokens });
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }

    const response = await geminiClient.generateUI({
      prompt,
      model: model || DEFAULT_MODEL,
      temperature,
      maxTokens,
    });

    res.json(response);
  } catch (error) {
    const errorMessage = sanitizeError(error);
    res.status(500).json({
      error: 'Failed to generate UI',
      message: errorMessage,
    });
  }
});

app.post('/api/generate/stream', async (req: Request, res: Response) => {
  const requestId = `req-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  try {
    const { prompt, model, temperature, maxTokens } = req.body;

    logInfo(`[${requestId}] Stream request received`, {
      promptLength: prompt?.length || 0,
      model: model || DEFAULT_MODEL,
      origin: req.headers.origin,
    });

    if (!prompt || typeof prompt !== 'string') {
      logError(`[${requestId}] Invalid prompt`, { prompt });
      return res.status(400).json({ error: 'Valid prompt is required' });
    }

    if (prompt.length > 10000) {
      logError(`[${requestId}] Prompt too long`, { length: prompt.length });
      return res.status(400).json({ error: 'Prompt too long (max 10000 characters)' });
    }

    const validation = validateGenerateParams({ temperature, maxTokens });
    if (!validation.valid) {
      logError(`[${requestId}] Validation failed`, { error: validation.error });
      return res.status(400).json({ error: validation.error });
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    let streamEnded = false;

    const safeWrite = (data: string) => {
      if (!streamEnded && !res.writableEnded) {
        res.write(data);
      }
    };

    const safeEnd = () => {
      if (!streamEnded && !res.writableEnded) {
        streamEnded = true;
        res.end();
      }
    };

    await geminiClient.generateUIWithCallbacks(
      {
        prompt,
        model: model || DEFAULT_MODEL,
        temperature,
        maxTokens,
      },
      {
        onComponent: (components) => {
          logInfo(`[${requestId}] Components received: ${components.length} components`);
          if (components.length > 0) {
            logInfo(`[${requestId}] First component type: ${components[0]?.type}, id: ${components[0]?.id}`);
          }
          safeWrite(`data: ${JSON.stringify({ type: 'components', data: components })}\n\n`);
        },
        onMetadata: (metadata) => {
          logInfo(`[${requestId}] Metadata: ${metadata?.title || 'No title'}`);
          safeWrite(`data: ${JSON.stringify({ type: 'metadata', data: metadata })}\n\n`);
        },
        onError: (error) => {
          logError(`[${requestId}] Generation error`, error);
          const errorMessage = sanitizeError(error);
          safeWrite(
            `data: ${JSON.stringify({ type: 'error', data: { message: errorMessage } })}\n\n`
          );
          safeEnd();
        },
        onDone: () => {
          logInfo(`[${requestId}] Stream completed successfully`);
          safeWrite(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
          safeEnd();
        },
      }
    );
  } catch (error) {
    logError(`[${requestId}] Stream generation failed`, error);
    const errorMessage = sanitizeError(error);
    if (!res.writableEnded) {
      res.write(
        `data: ${JSON.stringify({
          type: 'error',
          data: { message: errorMessage },
        })}\n\n`
      );
      res.end();
    }
  }
});

app.post('/v1/chat/completions', async (req: Request, res: Response) => {
  try {
    const { messages, model, temperature, max_tokens, stream } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    if (messages.length === 0) {
      return res.status(400).json({ error: 'Messages array cannot be empty' });
    }

    const validation = validateGenerateParams({
      temperature,
      maxTokens: max_tokens,
    });
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }

    const lastUserMessage = messages.filter((m: any) => m.role === 'user').pop();
    if (!lastUserMessage) {
      return res.status(400).json({ error: 'No user message found' });
    }

    if (stream) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      await geminiClient.generateUIWithCallbacks(
        {
          prompt: lastUserMessage.content,
          messages: messages.slice(0, -1),
          model: model || DEFAULT_MODEL,
          temperature,
          maxTokens: max_tokens,
        },
        {
          onComponent: (components) => {
            res.write(`data: ${JSON.stringify({ type: 'components', data: components })}\n\n`);
          },
          onMetadata: (metadata) => {
            res.write(`data: ${JSON.stringify({ type: 'metadata', data: metadata })}\n\n`);
          },
          onError: (error) => {
            const errorMessage = sanitizeError(error);
            res.write(
              `data: ${JSON.stringify({ type: 'error', data: { message: errorMessage } })}\n\n`
            );
            res.end();
          },
          onDone: () => {
            res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
            res.end();
          },
        }
      );
    } else {
      const response = await geminiClient.generateUI({
        prompt: lastUserMessage.content,
        messages: messages.slice(0, -1),
        model: model || DEFAULT_MODEL,
        temperature,
        maxTokens: max_tokens,
      });

      res.json({
        id: `re-${Date.now()}`,
        object: 'chat.completion',
        created: Math.floor(Date.now() / 1000),
        model: response.model,
        choices: [
          {
            index: 0,
            message: {
              role: 'assistant',
              content: JSON.stringify(response.ui),
            },
            finish_reason: 'stop',
          },
        ],
        usage: response.usage,
      });
    }
  } catch (error) {
    const errorMessage = sanitizeError(error);
    res.status(500).json({
      error: 'Failed to complete chat',
      message: errorMessage,
    });
  }
});

app.listen(PORT, () => {
  const startupMessage = `\nRe Generative UI API Server
Server running on http://localhost:${PORT}
Powered by Google Vertex AI Gemini

Endpoints:
  GET  /health - Health check
  POST /api/generate - Generate UI (non-streaming)
  POST /api/generate/stream - Generate UI (streaming)
  POST /v1/chat/completions - OpenAI-compatible endpoint

Security:
  CORS configured for: ${allowedOrigins.join(', ')}
  Request size limit: 1mb
  Input validation enabled
  Error sanitization active

Logging:
  API logs: ${LOG_PATH}
`;

  console.log(startupMessage);
  logInfo('API Server started', {
    port: PORT,
    model: DEFAULT_MODEL,
    location: DEFAULT_LOCATION,
    allowedOrigins,
  });
});

export default app;
