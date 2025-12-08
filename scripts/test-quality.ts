import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { GeminiClient, SYSTEM_PROMPT } from '../packages/core/src/client/gemini-client';
import { ServiceAccountCredentials } from '../packages/core/src/types';
import { uiResponseSchema } from '../packages/core/src/schemas';
import {
  calculateMaxDepth,
  collectComponentTypes,
  extractPropsUsage,
  hasPlaceholderData,
} from '../packages/core/src/utils/component-metrics';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const snapshotsDir = path.join(__dirname, 'snapshots');
const summaryPath = path.join(snapshotsDir, 'latest-summary.json');
const provider = (process.env.QUALITY_PROVIDER ?? 'vertex').toLowerCase();
const usingGoogle = provider === 'google';
const defaultMaxTokens = Number(process.env.QUALITY_MAX_TOKENS ?? '16384');
const throttleMs = Number(process.env.QUALITY_THROTTLE_MS ?? '4000');
const modelOverride =
  process.env.QUALITY_MODEL ??
  (usingGoogle ? 'gemini-2.0-flash' : 'gemini-2.5-flash');

const prompts = [
  'Show me a sales dashboard',
  'Create a sign-up form',
  'Display team members with roles',
  'Product details page for a gadget',
  'Empty shopping cart',
  'User profile settings',
  'Analytics charts for marketing',
  'Pricing table for SaaS plans',
  'Feature comparison for tiers',
  'Error state for payment failure',
  'Loading state for data fetch',
  "Search results for 'headphones'",
];

function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function loadServiceAccount(): Promise<ServiceAccountCredentials> {
  const inline = process.env.VERTEX_SERVICE_ACCOUNT_JSON;
  if (inline) return JSON.parse(inline);

  const candidatePath =
    process.env.VERTEX_SERVICE_ACCOUNT_PATH ||
    process.env.GOOGLE_APPLICATION_CREDENTIALS ||
    path.resolve(process.cwd(), 'service.json');

  if (candidatePath && (await awaitExists(candidatePath))) {
    const raw = await fs.readFile(candidatePath, 'utf-8');
    return JSON.parse(raw);
  }

  throw new Error(
    'Vertex AI credentials not found. Set VERTEX_SERVICE_ACCOUNT_JSON or VERTEX_SERVICE_ACCOUNT_PATH / GOOGLE_APPLICATION_CREDENTIALS.'
  );
}

async function awaitExists(filePath: string) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function buildGeminiClient() {
  const credentials = await loadServiceAccount();
  const projectId = process.env.VERTEX_PROJECT_ID || credentials.project_id;
  if (!projectId) {
    throw new Error(
      'Vertex AI project id missing. Set VERTEX_PROJECT_ID or include project_id in the service account json.'
    );
  }

  return new GeminiClient({
    projectId,
    location: process.env.VERTEX_LOCATION || 'us-central1',
    model: modelOverride,
    credentials,
    maxTokens: defaultMaxTokens,
  });
}

async function generateWithVertex(client: GeminiClient, prompt: string) {
  return client.generateUI({
    prompt,
    model: modelOverride,
    maxTokens: defaultMaxTokens,
    temperature: 0.3,
  });
}

async function generateWithGoogle(
  googleClient: GoogleGenerativeAI,
  prompt: string,
  maxTokens = defaultMaxTokens,
  attempt = 1
) {
  const model = googleClient.getGenerativeModel({
    model: modelOverride,
    systemInstruction: SYSTEM_PROMPT,
    generationConfig: {
      responseMimeType: 'application/json',
      maxOutputTokens: maxTokens,
      temperature: 0.3,
    },
  });

  const result = await model.generateContent(prompt);
  const candidate = result.response?.candidates?.[0];
  const text = (candidate?.content?.parts || [])
    .map((part: any) => (typeof part.text === 'string' ? part.text : ''))
    .join('')
    .trim();

  if (!text) {
    const finishReason = candidate?.finishReason;
    const safety = candidate?.safetyRatings;
    if (finishReason === 'MAX_TOKENS' && attempt < 3) {
      const nextTokens = Math.min(maxTokens * 2, 16000);
      console.warn(
        `[Quality] Google response truncated (max tokens reached). Retrying with ${nextTokens} tokens...`
      );
      return generateWithGoogle(googleClient, prompt, nextTokens, attempt + 1);
    }
    throw new Error(
      `Empty response from Google Generative AI (finishReason=${finishReason ?? 'unknown'} safety=${JSON.stringify(
        safety
      )})`
    );
  }

  let parsedJson: any;
  try {
    parsedJson = JSON.parse(text);
  } catch {
    if (attempt < 3) {
      const nextTokens = Math.min(maxTokens * 2, 16000);
      console.warn(
        `[Quality] Unable to parse Google response (likely truncated). Retrying with ${nextTokens} tokens...`
      );
      return generateWithGoogle(googleClient, prompt, nextTokens, attempt + 1);
    }
    throw new Error(`Failed to parse Google response: ${text}`);
  }

  const parsed = uiResponseSchema.parse(parsedJson);
  return {
    ui: parsed,
    model: modelOverride,
  };
}

async function readPreviousSummary() {
  try {
    const data = await fs.readFile(summaryPath, 'utf-8');
    return JSON.parse(data);
  } catch {
    return null;
  }
}

async function run() {
  const googleApiKey = process.env.GOOGLE_API_KEY;

  if (usingGoogle) {
    if (!googleApiKey) {
      console.error('Missing GOOGLE_API_KEY environment variable for quality test harness.');
      process.exit(1);
    }
  }

  await fs.mkdir(snapshotsDir, { recursive: true });

  const previousSummary = await readPreviousSummary();
  const vertexClient = usingGoogle ? null : await buildGeminiClient();
  const googleClient = usingGoogle ? new GoogleGenerativeAI(googleApiKey!) : null;
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const regressionNotes: string[] = [];
  const results: any[] = [];

  for (const prompt of prompts) {
    const response = await (usingGoogle
      ? generateWithGoogle(googleClient!, prompt)
      : generateWithVertex(vertexClient!, prompt));
    const components = response.ui.components;
    const componentTypes = collectComponentTypes(components);
    const nestingDepth = calculateMaxDepth(components);
    const placeholderDetected = hasPlaceholderData(components);
    const propsUsed = extractPropsUsage(components);

    const slug = slugify(prompt);
    const snapshotPath = path.join(snapshotsDir, `${slug}-${timestamp}.json`);
    const snapshotPayload = {
      prompt,
      generatedAt: new Date().toISOString(),
      response: response.ui,
      model: response.model,
      metrics: {
        componentTypes,
        nestingDepth,
        placeholderDetected,
      },
    };
    await fs.writeFile(snapshotPath, JSON.stringify(snapshotPayload, null, 2));

    const metrics = {
      componentTypesCount: componentTypes.length,
      nestingDepth,
      hasPlaceholderData: placeholderDetected,
      componentCount: components.length,
      propsUsed,
    };

    const issues: string[] = [];
    if (componentTypes.length < 3) {
      issues.push('Low component diversity');
    }
    if (nestingDepth < 2) {
      issues.push('Shallow layout structure');
    }
    if (placeholderDetected) {
      issues.push('Placeholder data detected');
    }

    const previousResult = previousSummary?.results?.find((entry: any) => entry.slug === slug);
    if (previousResult) {
      if (componentTypes.length + 1 < previousResult.metrics.componentTypesCount) {
        regressionNotes.push(`Component diversity dropped for "${prompt}".`);
      }
      if (nestingDepth + 1 < previousResult.metrics.nestingDepth) {
        regressionNotes.push(`Nesting depth decreased for "${prompt}".`);
      }
    }

    results.push({ prompt, slug, metrics, issues });
    console.log(
      `[Quality] ${prompt} -> ${componentTypes.length} types, depth ${nestingDepth}, placeholder: ${
        placeholderDetected ? 'yes' : 'no'
      }`
    );

    if (throttleMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, throttleMs));
    }
  }

  const summary = {
    runId: timestamp,
    generatedAt: new Date().toISOString(),
    results,
  };

  const timestampedSummaryPath = path.join(snapshotsDir, `summary-${timestamp}.json`);
  await fs.writeFile(timestampedSummaryPath, JSON.stringify(summary, null, 2));
  await fs.writeFile(summaryPath, JSON.stringify(summary, null, 2));

  const blockingIssues = [...regressionNotes, ...results.flatMap((result) => result.issues)];

  if (blockingIssues.length > 0) {
    console.error('Quality check detected issues:');
    blockingIssues.forEach((issue) => console.error(`- ${issue}`));
    process.exitCode = 1;
  } else {
    console.log('Quality check passed with no blocking issues.');
  }
}

run().catch((error) => {
  console.error('Quality test harness failed:', error);
  process.exit(1);
});
