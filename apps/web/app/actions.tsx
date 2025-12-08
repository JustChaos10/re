'use server';

import { streamUI } from 'ai/rsc';
import { getVertexModel } from '@/lib/google-vertex';
import {
  renderInterfaceSchema,
  renderInterfaceTool,
  type RenderInterfacePayload,
} from '@/lib/schema';

function buildSystemPrompt() {
  return `
You are a Generative UI Engine. You never chat—you only emit JSON that satisfies the \`render_interface\` tool schema.

Available modules: Header, Section, LayoutRow, LayoutColumn, StockCard, InfoCard, WeatherWidget, Alert, AnalysisText, TextBlock, KeyTakeaways, InsightCard, MetricList, ComparisonRow, TimelineComparison, RelatedQueries, Divider.

Rules:
1. Every factual statement must reference concrete, real-world details (e.g., "Halo cockpit saved drivers since 2018", not "safety improved").
2. Comparison prompts must produce at least one ComparisonRow or TimelineComparison plus paired InfoCards.
3. Summaries must include a Header plus AnalysisText/TextBlock with 3+ sentences.
4. Always add KeyTakeaways and RelatedQueries so users get follow-ups.
5. No placeholders, no generic labels like "Item A/B". Use real company names, stats, or era descriptions.

Example payload (abbreviated):
{
  "components": [
    { "type": "Header", "props": { "title": "F1 Safety Evolution", "subtitle": "2000s vs modern era" } },
    { "type": "KeyTakeaways", "props": { "items": [
        { "label": "Hybrid era", "caption": "Energy recovery + battery torque", "trend": "up" },
        { "label": "Safety leap", "caption": "Halo + carbon shields", "trend": "up" }
    ]}},
    { "type": "TimelineComparison", "props": { "eras": [
        { "era": "2000s", "bullets": ["Refueling pit stops", "TV-only broadcasts", "HANS device introduced"] },
        { "era": "Now", "bullets": ["Hybrid power units (2014)", "Drive to Survive fandom", "Halo zero fatalities since 2018"] }
    ] }},
    { "type": "RelatedQueries", "props": { "queries": [
        { "prompt": "Explain DRS impact on overtakes" },
        { "prompt": "Compare Ferrari 2004 vs Red Bull 2023" },
        { "prompt": "Break down a modern pit stop sequence" }
    ]}}
  ]
}

Quality checklist before returning:
✓ Data has specific names/dates/metrics.
✓ Every timeline bullet is unique and non-empty.
✓ No placeholder or boilerplate phrasing.
✓ Provide at least one follow-up CTA via RelatedQueries.
`.trim();
}

const bannedPhrases = [/lorem/i, /placeholder/i, /dummy/i, /sample/i, /todo/i];

function flattenComponents(components: RenderInterfacePayload['components']) {
  const all: any[] = [];
  const stack = [...components];
  while (stack.length) {
    const next = stack.shift();
    if (!next) continue;
    all.push(next);
    if (next.children) {
      stack.push(...next.children);
    }
  }
  return all;
}

function evaluatePayload(payload: RenderInterfacePayload, userPrompt: string) {
  const issues: string[] = [];
  const serialized = JSON.stringify(payload).toLowerCase();
  if (bannedPhrases.some((regex) => regex.test(serialized))) {
    issues.push('remove placeholder text and provide concrete facts');
  }

  const nodes = flattenComponents(payload.components);
  const narrative = nodes
    .filter((node) => node.type === 'AnalysisText' || node.type === 'TextBlock')
    .map((node) => node.props?.content || '')
    .join(' ');
  if (narrative.length < 160) {
    issues.push('add a deeper narrative (at least 3 sentences of context)');
  }

  const hasTakeaways = nodes.some((node) => node.type === 'KeyTakeaways' || node.type === 'MetricList');
  if (!hasTakeaways) {
    issues.push('include KeyTakeaways or MetricList summarizing insights');
  }

  const hasRelated = nodes.some((node) => node.type === 'RelatedQueries');
  if (!hasRelated) {
    issues.push('append RelatedQueries with 3+ follow-ups');
  }

  const isComparePrompt = /\bcompare\b| vs | versus /i.test(userPrompt);
  if (isComparePrompt) {
    const hasComparison = nodes.some(
      (node) => node.type === 'ComparisonRow' || node.type === 'TimelineComparison' || node.type === 'LayoutRow'
    );
    if (!hasComparison) {
      issues.push('render comparison components (ComparisonRow or TimelineComparison) for the requested contrast');
    }
  }

  return {
    valid: issues.length === 0,
    issues,
  };
}

type AttemptResult = {
  payload: RenderInterfacePayload;
  rawOutput: string;
};

async function runModelAttempt({
  userInput,
  systemPrompt,
  modelId,
}: {
  userInput: string;
  systemPrompt: string;
  modelId: string;
}): Promise<AttemptResult> {
  const model = await getVertexModel(modelId);
  let finalPayload: RenderInterfacePayload | null = null;
  let rawOutput = '';

  const temperature = Number(process.env.NEXT_VERTEX_TEMPERATURE ?? 0.45);
  const topP = Number(process.env.NEXT_VERTEX_TOP_P ?? 0.9);
  const maxTokens = Number(process.env.NEXT_VERTEX_MAX_TOKENS ?? 2048);

  await streamUI({
    model,
    system: systemPrompt,
    messages: [{ role: 'user', content: userInput }],
    maxRetries: 2,
    temperature,
    topP,
    maxTokens,
    toolChoice: {
      type: 'tool',
      name: renderInterfaceTool.name,
    },
    tools: {
      [renderInterfaceTool.name]: {
        description: renderInterfaceTool.description,
        parameters: renderInterfaceSchema,
        async generate(args) {
          finalPayload = args;
          return null;
        },
      },
    },
    text: async ({ content }) => {
      rawOutput = content;
      return null;
    },
  });

  if (!finalPayload) {
    throw new Error('Model failed to construct a render_interface payload.');
  }

  return { payload: finalPayload, rawOutput };
}

export async function generateInterfaceAction({ prompt }: { prompt: string }) {
  const userInput = prompt?.trim();
  if (!userInput) {
    throw new Error('A user query is required.');
  }

  const baseSystemPrompt = buildSystemPrompt();
  console.log('[LOG] User Input:', userInput);
  console.log('[LOG] System Prompt:', baseSystemPrompt);

  const attemptModels = [
    process.env.NEXT_VERTEX_MODEL || 'gemini-2.5-flash',
    process.env.NEXT_VERTEX_MODEL_FALLBACK || 'gemini-2.5-pro',
  ];

  let extraGuidance = '';
  for (let attempt = 0; attempt < attemptModels.length; attempt++) {
    const modelId = attemptModels[attempt];
    const systemPrompt = `${baseSystemPrompt}\n\n${extraGuidance}`.trim();
    console.log(`[LOG] Attempt ${attempt + 1} using model ${modelId}`);

    const { payload, rawOutput } = await runModelAttempt({
      userInput,
      systemPrompt,
      modelId,
    });

    const evaluation = evaluatePayload(payload, userInput);
    if (evaluation.valid) {
      console.log('[LOG] Raw LLM Output:', rawOutput);
      console.log('[LOG] Generated UI JSON:', JSON.stringify(payload, null, 2));
      return payload;
    }

    console.warn('[LOG] Validation failed:', evaluation.issues.join('; '));
    extraGuidance = `Revise the interface with the following corrections: ${evaluation.issues.join(
      '; '
    )}. Add richer data, more concrete points, and comply with every rule.`;
  }

  throw new Error('Failed to produce a high-fidelity interface after multiple attempts. Please try again.');
}
