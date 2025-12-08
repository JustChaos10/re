import React from 'react';
import * as LucideIcons from 'lucide-react';
import { LucideProps } from 'lucide-react';

export interface IconProps {
  props: {
    name?: string;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'muted' | string;
    strokeWidth?: number;
  };
}

const sizeMap = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
};

const colorMap: Record<string, string> = {
  primary: 'var(--re-primary)',
  secondary: 'var(--re-text-secondary)',
  success: 'var(--re-success)',
  warning: 'var(--re-warning)',
  error: 'var(--re-error)',
  muted: 'var(--re-text-tertiary)',
};

// Convert kebab-case or snake_case to PascalCase for Lucide icons
function toIconName(name?: string): string {
  if (!name) return '';
  return name
    .split(/[-_]/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join('');
}

export function Icon({ props }: IconProps) {
  const { name, size = 'md', color = 'currentColor', strokeWidth = 2 } = props;

  const resolvedSize = sizeMap[size] ?? sizeMap.md;
  const iconName = toIconName(name);
  const IconComponent = iconName ? ((LucideIcons as any)[iconName] as React.ComponentType<LucideProps>) : null;

  if (!IconComponent) {
    const FallbackIcon = LucideIcons.HelpCircle;
    if (name) {
      console.warn(`Icon "${name}" not found, using fallback`);
    } else {
      console.warn('Icon name missing, using fallback');
    }
    return (
      <FallbackIcon
        size={resolvedSize}
        color={colorMap[color] || color}
        strokeWidth={strokeWidth}
        className="re-icon"
      />
    );
  }

  return (
    <IconComponent
      size={resolvedSize}
      color={colorMap[color] || color}
      strokeWidth={strokeWidth}
      className="re-icon"
    />
  );
}
