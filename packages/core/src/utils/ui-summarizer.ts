import { Component } from '../types';

type SummarizeOptions = {
  maxDepth: number;
  maxNodes: number;
  maxStringLength: number;
  maxArrayPreview: number;
  maxPropNesting: number;
  maxObjectKeys: number;
};

type SummarizeContext = {
  options: SummarizeOptions;
  nodeCount: number;
  truncated: boolean;
};

type SummarizeResult = {
  summary: any;
  truncated: boolean;
  jsonLength: number;
};

const DEFAULT_OPTIONS: SummarizeOptions = {
  maxDepth: 4,
  maxNodes: 150,
  maxStringLength: 280,
  maxArrayPreview: 3,
  maxPropNesting: 2,
  maxObjectKeys: 12,
};

const FALLBACK_OPTIONS: SummarizeOptions = {
  maxDepth: 3,
  maxNodes: 90,
  maxStringLength: 160,
  maxArrayPreview: 1,
  maxPropNesting: 1,
  maxObjectKeys: 8,
};

const PRIORITY_KEYS = [
  'id',
  'type',
  'title',
  'subtitle',
  'label',
  'description',
  'message',
  'content',
  'name',
  'value',
  'chartType',
  'xKey',
  'yKey',
  'onClick',
  'onSubmit',
];

function normalizeInput(input: any) {
  if (!input) return { components: [], metadata: undefined };
  if (Array.isArray(input)) {
    return { components: input as Component[], metadata: undefined };
  }
  if (typeof input === 'object') {
    return {
      components: Array.isArray((input as any).components)
        ? (input as any).components
        : [],
      metadata: (input as any).metadata,
    };
  }
  return { components: [], metadata: undefined };
}

function truncateString(value: string, max: number) {
  if (value.length <= max) return value;
  return `${value.slice(0, max)}…`;
}

function pruneValue(value: any, ctx: SummarizeContext, depth = 0): any {
  if (value === null || value === undefined) return value;
  if (typeof value === 'string') return truncateString(value, ctx.options.maxStringLength);
  if (typeof value === 'number' || typeof value === 'boolean') return value;
  if (typeof value === 'function') return undefined;

  if (Array.isArray(value)) {
    const preview = value.slice(0, ctx.options.maxArrayPreview).map((item) =>
      pruneValue(item, ctx, depth + 1)
    );
    const result: any = preview;
    if (value.length > preview.length) {
      ctx.truncated = true;
      result.push({ summary: `${value.length - preview.length} more items` });
    }
    return result;
  }

  if (typeof value === 'object') {
    if (depth >= ctx.options.maxPropNesting) {
      ctx.truncated = true;
      return { summary: 'truncated-nesting' };
    }

    const obj: Record<string, any> = {};
    const entries = Object.entries(value);
    // Prioritize important keys first
    const sorted = entries.sort(([a], [b]) => {
      const aIdx = PRIORITY_KEYS.indexOf(a);
      const bIdx = PRIORITY_KEYS.indexOf(b);
      if (aIdx === -1 && bIdx === -1) return 0;
      if (aIdx === -1) return 1;
      if (bIdx === -1) return -1;
      return aIdx - bIdx;
    });

    for (const [key, val] of sorted.slice(0, ctx.options.maxObjectKeys)) {
      const pruned = pruneValue(val, ctx, depth + 1);
      if (pruned !== undefined) {
        obj[key] = pruned;
      }
    }

    if (entries.length > ctx.options.maxObjectKeys) {
      ctx.truncated = true;
      obj.summary = `+${entries.length - ctx.options.maxObjectKeys} more fields`;
    }

    return obj;
  }

  return undefined;
}

function summarizeComponent(
  component: Component,
  depth: number,
  ctx: SummarizeContext
): any {
  if (!component || typeof component !== 'object') return undefined;
  if (ctx.nodeCount >= ctx.options.maxNodes) {
    ctx.truncated = true;
    return undefined;
  }

  ctx.nodeCount += 1;

  const summary: any = {
    id: (component as any).id,
    type: (component as any).type,
  };

  if (component.props) {
    const props = pruneValue(component.props, ctx);
    if (props && Object.keys(props).length > 0) {
      summary.props = props;
    }
  }

  const children = (component as any).children;
  if (Array.isArray(children) && children.length > 0) {
    if (depth < ctx.options.maxDepth) {
      const summarizedChildren = children
        .map((child) => summarizeComponent(child, depth + 1, ctx))
        .filter(Boolean);
      if (summarizedChildren.length > 0) {
        summary.children = summarizedChildren;
      }
    } else {
      ctx.truncated = true;
      summary.childCount = children.length;
    }
  }

  return summary;
}

function buildSummary(input: any, options: SummarizeOptions): SummarizeResult {
  const ctx: SummarizeContext = {
    options,
    nodeCount: 0,
    truncated: false,
  };
  const { components, metadata } = normalizeInput(input);
  const summarizedComponents = Array.isArray(components)
    ? components
        .map((comp) => summarizeComponent(comp, 0, ctx))
        .filter(Boolean)
    : [];

  const summary: any = { components: summarizedComponents };
  if (metadata) {
    summary.metadata = pruneValue(metadata, ctx);
  }

  const jsonLength = JSON.stringify(summary).length;
  return {
    summary,
    truncated: ctx.truncated,
    jsonLength,
  };
}

/**
 * Produces a prompt-safe summary of the current UI, pruning heavy fields
 * while preserving structure, ids, labels, and key props.
 */
export function summarizeUIForPrompt(
  currentUI: any,
  maxJsonLength = 7000
): SummarizeResult {
  const primary = buildSummary(currentUI, DEFAULT_OPTIONS);
  if (primary.jsonLength <= maxJsonLength) {
    return primary;
  }

  const fallback = buildSummary(currentUI, FALLBACK_OPTIONS);
  return {
    summary: fallback.summary,
    truncated: true,
    jsonLength: fallback.jsonLength,
  };
}
