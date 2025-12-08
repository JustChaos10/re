import fs from 'fs';
import path from 'path';
import { GeminiClient } from '../packages/core/src/client/gemini-client';
import { ServiceAccountCredentials } from '../packages/core/src/types';

const prompts = [
  'Show me a sales dashboard with KPIs, a chart, and a table of top products.',
  'Create a sign-up form with name, email, password, and role select.',
  'Empty state for a shopping cart with helpful guidance.',
  'Team directory with avatars, roles, and contact emails.',
  'Payment failure error state with actions to retry or contact support.',
  'Project dashboard with milestones, progress bar, and risk callouts.',
  'Order history table with 6 realistic rows and status badges.',
  'Analytics chart comparing planned vs actual over 6 months.',
  'Settings page with profile inputs and notification selects.',
  'Support ticket list with priorities and timestamps.',
];

type EvalResult = {
  prompt: string;
  ok: boolean;
  reason?: string;
  durationMs: number;
};

function loadServiceAccount(): ServiceAccountCredentials {
  const inline = process.env.VERTEX_SERVICE_ACCOUNT_JSON;
  if (inline) return JSON.parse(inline);

  const candidatePath =
    process.env.VERTEX_SERVICE_ACCOUNT_PATH ||
    process.env.GOOGLE_APPLICATION_CREDENTIALS ||
    path.resolve(process.cwd(), 'service.json');

  if (candidatePath && fs.existsSync(candidatePath)) {
    const raw = fs.readFileSync(candidatePath, 'utf-8');
    return JSON.parse(raw);
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
    location: process.env.VERTEX_LOCATION || 'us-central1',
    model: process.env.VERTEX_MODEL || 'gemini-2.5-flash',
    credentials,
    maxTokens: 512,
  });
}

(async () => {
  const client = buildGeminiClient();
  const out: EvalResult[] = [];

  for (const prompt of prompts) {
    const start = Date.now();
    try {
      await client.generateUI({ prompt });
      out.push({ prompt, ok: true, durationMs: Date.now() - start });
    } catch (e: any) {
      out.push({ prompt, ok: false, reason: e?.message, durationMs: Date.now() - start });
    }
  }

  console.table(
    out.map((r) => ({
      prompt: r.prompt.slice(0, 40) + (r.prompt.length > 40 ? '.' : ''),
      ok: r.ok,
      ms: r.durationMs,
      reason: r.reason || '',
    }))
  );

  const logPath = path.join(__dirname, 'eval-results.jsonl');
  const lines = out.map((r) => JSON.stringify(r)).join('\n');
  fs.writeFileSync(logPath, lines, 'utf8');
  console.log('Wrote eval results to', logPath);
})().catch((error) => {
  console.error('Eval runner failed:', error);
  process.exit(1);
});
