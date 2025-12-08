import { Component } from '../types';

function walkComponents(components: Component[], visitor: (component: Component) => void) {
  components.forEach((component) => {
    visitor(component);
    if (component.children && component.children.length > 0) {
      walkComponents(component.children as Component[], visitor);
    }
  });
}

function traverseValues(value: unknown, onString: (text: string) => void) {
  if (typeof value === 'string') {
    onString(value);
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((entry) => traverseValues(entry, onString));
    return;
  }

  if (value && typeof value === 'object') {
    Object.values(value as Record<string, unknown>).forEach((entry) =>
      traverseValues(entry, onString)
    );
  }
}

export function collectComponentTypes(components: Component[]): string[] {
  const types = new Set<string>();
  walkComponents(components, (component) => {
    types.add(component.type);
  });
  return Array.from(types);
}

export function calculateMaxDepth(components: Component[], depth = 1): number {
  return components.reduce((maxDepth, component) => {
    if (!component.children || component.children.length === 0) {
      return Math.max(maxDepth, depth);
    }
    return Math.max(
      maxDepth,
      calculateMaxDepth(component.children as Component[], depth + 1)
    );
  }, depth);
}

export function extractPropsUsage(components: Component[]): Record<string, number> {
  const usage: Record<string, number> = {};
  walkComponents(components, (component) => {
    if (!component.props) return;
    Object.keys(component.props).forEach((key) => {
      usage[key] = (usage[key] || 0) + 1;
    });
  });
  return usage;
}

export function hasPlaceholderData(components: Component[]): boolean {
  const placeholderPatterns = [
    /lorem ipsum/i,
    /\buser\s?\d+/i,
    /\bitem\s?\d+/i,
    /placeholder/i,
    /\bsample\b/i,
  ];

  let containsPlaceholder = false;
  walkComponents(components, (component) => {
    traverseValues(component.props, (text) => {
      if (placeholderPatterns.some((pattern) => pattern.test(text))) {
        containsPlaceholder = true;
      }
    });
  });

  return containsPlaceholder;
}
