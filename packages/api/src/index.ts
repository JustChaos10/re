import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GroqClient } from '@re/core';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Generate UI endpoint (non-streaming)
app.post('/api/generate', async (req: Request, res: Response) => {
  try {
    const { prompt, model, temperature, maxTokens, apiKey } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const groqApiKey = apiKey || process.env.GROQ_API_KEY;
    if (!groqApiKey) {
      return res.status(400).json({ error: 'GROQ_API_KEY is required' });
    }

    const client = new GroqClient({ apiKey: groqApiKey });
    const response = await client.generateUI({
      prompt,
      model,
      temperature,
      maxTokens,
    });

    res.json(response);
  } catch (error) {
    console.error('Error generating UI:', error);
    res.status(500).json({
      error: 'Failed to generate UI',
      message: error instanceof Error ? error.message : String(error),
    });
  }
});

// Generate UI endpoint (streaming)
app.post('/api/generate/stream', async (req: Request, res: Response) => {
  try {
    const { prompt, model, temperature, maxTokens, apiKey } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const groqApiKey = apiKey || process.env.GROQ_API_KEY;
    if (!groqApiKey) {
      return res.status(400).json({ error: 'GROQ_API_KEY is required' });
    }

    // Set up SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const client = new GroqClient({ apiKey: groqApiKey });

    await client.generateUIWithCallbacks(
      {
        prompt,
        model,
        temperature,
        maxTokens,
      },
      {
        onComponent: (components) => {
          res.write(`data: ${JSON.stringify({ type: 'components', data: components })}\n\n`);
        },
        onMetadata: (metadata) => {
          res.write(`data: ${JSON.stringify({ type: 'metadata', data: metadata })}\n\n`);
        },
        onError: (error) => {
          res.write(
            `data: ${JSON.stringify({ type: 'error', data: { message: error.message } })}\n\n`
          );
          res.end();
        },
        onDone: () => {
          res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
          res.end();
        },
      }
    );
  } catch (error) {
    console.error('Error streaming UI:', error);
    res.write(
      `data: ${JSON.stringify({
        type: 'error',
        data: { message: error instanceof Error ? error.message : String(error) },
      })}\n\n`
    );
    res.end();
  }
});

// OpenAI-compatible chat completions endpoint
app.post('/v1/chat/completions', async (req: Request, res: Response) => {
  try {
    const { messages, model, temperature, max_tokens, stream } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    const groqApiKey = process.env.GROQ_API_KEY;
    if (!groqApiKey) {
      return res.status(400).json({ error: 'GROQ_API_KEY is required' });
    }

    // Extract the last user message as prompt
    const lastUserMessage = messages.filter((m: any) => m.role === 'user').pop();
    if (!lastUserMessage) {
      return res.status(400).json({ error: 'No user message found' });
    }

    const client = new GroqClient({ apiKey: groqApiKey });

    if (stream) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      await client.generateUIWithCallbacks(
        {
          prompt: lastUserMessage.content,
          messages: messages.slice(0, -1),
          model,
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
            res.write(
              `data: ${JSON.stringify({ type: 'error', data: { message: error.message } })}\n\n`
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
      const response = await client.generateUI({
        prompt: lastUserMessage.content,
        messages: messages.slice(0, -1),
        model,
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
    console.error('Error in chat completions:', error);
    res.status(500).json({
      error: 'Failed to complete chat',
      message: error instanceof Error ? error.message : String(error),
    });
  }
});

app.listen(PORT, () => {
  console.log(`\n🚀 Re Generative UI API Server`);
  console.log(`📡 Server running on http://localhost:${PORT}`);
  console.log(`✨ Powered by Groq\n`);
  console.log(`Endpoints:`);
  console.log(`  GET  /health - Health check`);
  console.log(`  POST /api/generate - Generate UI (non-streaming)`);
  console.log(`  POST /api/generate/stream - Generate UI (streaming)`);
  console.log(`  POST /v1/chat/completions - OpenAI-compatible endpoint\n`);
});

export default app;
