import React from 'react';

export interface IllustrationProps {
  props: {
    name?: 'empty-state' | 'success' | 'error' | 'search' | 'notification' | 'chart' | 'document' | 'settings' | 'user' | 'folder';
    svg?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    color?: 'primary' | 'secondary' | 'muted';
  };
}

const sizeMap = {
  sm: 64,
  md: 120,
  lg: 180,
  xl: 240,
};

const colorMap: Record<string, string> = {
  primary: 'var(--re-primary)',
  secondary: 'var(--re-text-secondary)',
  muted: 'var(--re-text-tertiary)',
};

// Built-in illustration SVGs
const illustrations: Record<string, string> = {
  'empty-state': `<svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="20" y="30" width="80" height="60" rx="8" stroke="currentColor" stroke-width="2" fill="none"/>
    <circle cx="45" cy="55" r="8" stroke="currentColor" stroke-width="2" fill="none"/>
    <path d="M60 45 L90 45" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    <path d="M60 55 L85 55" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    <path d="M60 65 L75 65" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    <path d="M35 100 L85 100" stroke="currentColor" stroke-width="2" stroke-linecap="round" opacity="0.5"/>
  </svg>`,
  'success': `<svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="60" cy="60" r="40" stroke="currentColor" stroke-width="3" fill="none"/>
    <path d="M40 60 L55 75 L80 45" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  </svg>`,
  'error': `<svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="60" cy="60" r="40" stroke="currentColor" stroke-width="3" fill="none"/>
    <path d="M45 45 L75 75" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
    <path d="M75 45 L45 75" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
  </svg>`,
  'search': `<svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="25" stroke="currentColor" stroke-width="3" fill="none"/>
    <path d="M68 68 L90 90" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
    <path d="M40 50 L60 50" stroke="currentColor" stroke-width="2" stroke-linecap="round" opacity="0.5"/>
    <path d="M50 40 L50 60" stroke="currentColor" stroke-width="2" stroke-linecap="round" opacity="0.5"/>
  </svg>`,
  'notification': `<svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M60 25 L60 30" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    <path d="M35 55 C35 40 45 30 60 30 C75 30 85 40 85 55 L85 70 L95 80 L25 80 L35 70 Z" stroke="currentColor" stroke-width="2" fill="none"/>
    <path d="M50 85 C50 92 55 97 60 97 C65 97 70 92 70 85" stroke="currentColor" stroke-width="2" fill="none"/>
    <circle cx="80" cy="35" r="8" fill="currentColor" opacity="0.8"/>
  </svg>`,
  'chart': `<svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="20" y="70" width="15" height="30" rx="2" stroke="currentColor" stroke-width="2" fill="none"/>
    <rect x="42" y="50" width="15" height="50" rx="2" stroke="currentColor" stroke-width="2" fill="none"/>
    <rect x="64" y="35" width="15" height="65" rx="2" stroke="currentColor" stroke-width="2" fill="none"/>
    <rect x="86" y="55" width="15" height="45" rx="2" stroke="currentColor" stroke-width="2" fill="none"/>
    <path d="M15 105 L105 105" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
  </svg>`,
  'document': `<svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M30 20 L30 100 L90 100 L90 40 L70 20 Z" stroke="currentColor" stroke-width="2" fill="none"/>
    <path d="M70 20 L70 40 L90 40" stroke="currentColor" stroke-width="2" fill="none"/>
    <path d="M40 55 L80 55" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    <path d="M40 70 L80 70" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    <path d="M40 85 L65 85" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
  </svg>`,
  'settings': `<svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="60" cy="60" r="15" stroke="currentColor" stroke-width="2" fill="none"/>
    <path d="M60 20 L60 35" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
    <path d="M60 85 L60 100" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
    <path d="M20 60 L35 60" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
    <path d="M85 60 L100 60" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
    <path d="M31.7 31.7 L42.4 42.4" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
    <path d="M77.6 77.6 L88.3 88.3" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
    <path d="M31.7 88.3 L42.4 77.6" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
    <path d="M77.6 42.4 L88.3 31.7" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
  </svg>`,
  'user': `<svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="60" cy="40" r="20" stroke="currentColor" stroke-width="2" fill="none"/>
    <path d="M25 100 C25 75 40 65 60 65 C80 65 95 75 95 100" stroke="currentColor" stroke-width="2" fill="none"/>
  </svg>`,
  'folder': `<svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 35 L20 90 L100 90 L100 45 L55 45 L45 35 Z" stroke="currentColor" stroke-width="2" fill="none"/>
    <path d="M20 45 L100 45" stroke="currentColor" stroke-width="2"/>
  </svg>`,
};

export function Illustration({ props }: IllustrationProps) {
  const { name, svg, size = 'md', color = 'primary' } = props;
  const dimension = sizeMap[size];
  const svgContent = svg || (name ? illustrations[name] : illustrations['empty-state']);

  const style: React.CSSProperties = {
    width: dimension,
    height: dimension,
    color: colorMap[color] || color,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  return (
    <div 
      className="re-illustration" 
      style={style}
      dangerouslySetInnerHTML={{ __html: svgContent }}
      aria-hidden="true"
    />
  );
}
