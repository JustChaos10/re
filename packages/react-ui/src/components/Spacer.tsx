import React from 'react';

export interface SpacerProps {
  props?: {
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  };
}

const sizeMap = {
  xs: 'var(--re-space-xs)',
  sm: 'var(--re-space-sm)',
  md: 'var(--re-space-md)',
  lg: 'var(--re-space-lg)',
  xl: 'var(--re-space-xl)',
  '2xl': 'var(--re-space-2xl)',
  '3xl': 'var(--re-space-3xl)',
};

export function Spacer({ props }: SpacerProps) {
  const { size = 'md' } = props || {};

  const style: React.CSSProperties = {
    height: sizeMap[size],
    width: '100%',
    flexShrink: 0,
  };

  return <div className="re-spacer" style={style} aria-hidden="true" />;
}
