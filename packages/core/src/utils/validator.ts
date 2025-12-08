import { Component } from '../types';

type ValidationResult = { ok: true } | { ok: false; reason: string };

// Only match obvious placeholders, not realistic data like "user 123" or "sample dashboard"
const PLACEHOLDER_REGEX = /\b(lorem ipsum|placeholder text|placeholder|xxx+|tbd|todo|fixme)\b/i;
const ALLOWED_TYPES = new Set([
  'text','heading','button','card','list','table','chart','form','input','select','image','alert',
  'progress','badge','divider','container','icon','stack','section','split','spacer','illustration',
  'callout','stat','avatar','tag-group'
]);

export function validateUI(components: Component[], maxDepth = 4): ValidationResult {
  const ids = new Set<string>();
  const errors: string[] = [];

  const walk = (node: Component, depth: number) => {
    if (depth > maxDepth) errors.push(`Nesting too deep at ${node.id}`);
    if (!ALLOWED_TYPES.has((node as any).type)) errors.push(`Invalid type ${node.type}`);
    if (ids.has(node.id)) errors.push(`Duplicate id ${node.id}`);
    ids.add(node.id);

    if (hasPlaceholder(node)) errors.push(`Placeholder content in ${node.id}`);

    validateRequired(node, errors);

    (node.children || []).forEach(child => walk(child, depth + 1));
  };

  components.forEach(c => walk(c, 1));

  if (errors.length) return { ok: false, reason: errors[0] };
  return { ok: true };
}

function hasPlaceholder(node: Component) {
  const scan = (val: any): boolean => {
    if (typeof val === 'string') return PLACEHOLDER_REGEX.test(val);
    if (Array.isArray(val)) return val.some(scan);
    if (val && typeof val === 'object') return Object.values(val).some(scan);
    return false;
  };
  return scan((node as any).props);
}

function validateRequired(node: Component, errors: string[]) {
  const props: any = (node as any).props || {};
  switch (node.type) {
    case 'heading':
      if (!props.content) errors.push('Heading missing content');
      break;
    case 'text':
      if (!props.content) errors.push('Text missing content');
      break;
    case 'button':
      if (!props.label) errors.push('Button missing label');
      break;
    case 'image':
      if (!props.src || !props.alt) errors.push('Image needs src and alt');
      break;
    case 'input':
      if (!props.name || !props.label) errors.push('Input needs name/label');
      break;
    case 'select':
      if (!props.name || !props.label || !Array.isArray(props.options) || props.options.length < 1) {
        errors.push('Select needs name/label/options');
      }
      break;
    case 'table':
      if (!Array.isArray(props.headers) || props.headers.length < 2) errors.push('Table needs headers');
      if (!Array.isArray(props.rows) || props.rows.length < 1) errors.push('Table needs rows');
      break;
    case 'list':
      if (!Array.isArray(props.items) || props.items.length < 1) errors.push('List needs items');
      break;
    case 'stat':
      if (!props.label || props.value === undefined) errors.push('Stat needs label/value');
      break;
  }
}
