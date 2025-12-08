import { Component } from '../types';

function normalizeComponentName(type: string): string {
  return type
    .split('-')
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join('');
}

export function generateReactCode(components: Component[]): string {
  const imports = new Set<string>(['React']);
  const componentCode = components.map(c => generateComponentCode(c, imports)).join('\n\n');
  
  const importArray = Array.from(imports).filter(i => i !== 'React').sort();
  const importStatement = `import React from 'react';\nimport { ${importArray.join(', ')} } from '@re/react-ui';`;

  return `${importStatement}\n\nexport default function GeneratedUI() {\n  return (\n    <>\n${indent(componentCode, 6)}\n    </>\n  );\n}`;
}

function generateComponentCode(component: Component, imports: Set<string>): string {
  const { type, props, children } = component;
  
  // Map type to component name (e.g., 'button' -> 'Button')
  const componentName = normalizeComponentName(type);
  imports.add(componentName);

  // Generate props string
  const propsString = Object.entries(props || {})
    .map(([key, value]) => {
      if (key === 'children') return '';
      if (typeof value === 'string') return `${key}="${value}"`;
      if (typeof value === 'boolean') return value ? key : `${key}={false}`;
      return `${key}={${JSON.stringify(value)}}`;
    })
    .filter(Boolean)
    .join(' ');

  // Generate children code
  let childrenCode = '';
  if (children && children.length > 0) {
    childrenCode = '\n' + children.map(child => indent(generateComponentCode(child, imports), 2)).join('\n') + '\n';
  }

  if (childrenCode) {
    return `<${componentName} ${propsString}>${childrenCode}</${componentName}>`;
  } else {
    return `<${componentName} ${propsString} />`;
  }
}

function indent(str: string, spaces: number): string {
  return str.split('\n').map(line => ' '.repeat(spaces) + line).join('\n');
}
