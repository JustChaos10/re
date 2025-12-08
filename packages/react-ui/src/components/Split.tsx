import React from 'react';
import clsx from 'clsx';
import { Component } from '@re/core';
import { ComponentRenderer } from '../renderer';

export interface SplitProps {
  component: {
    id: string;
    props?: {
      ratio?: '1:1' | '1:2' | '2:1' | '1:3' | '3:1' | '1:4' | '4:1';
      gap?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
      vertical?: boolean;
      reversed?: boolean;
    };
    children?: Component[];
  };
  onAction?: (actionId: string, data?: any) => void;
}

const ratioMap: Record<string, [string, string]> = {
  '1:1': ['1fr', '1fr'],
  '1:2': ['1fr', '2fr'],
  '2:1': ['2fr', '1fr'],
  '1:3': ['1fr', '3fr'],
  '3:1': ['3fr', '1fr'],
  '1:4': ['1fr', '4fr'],
  '4:1': ['4fr', '1fr'],
};

const gapMap = {
  none: 'var(--gap-none)',
  sm: 'var(--gap-sm)',
  md: 'var(--gap-md)',
  lg: 'var(--gap-lg)',
  xl: 'var(--gap-xl)',
};

export function Split({ component, onAction }: SplitProps) {
  const {
    ratio = '1:1',
    gap = 'lg',
    vertical = true,
    reversed = false,
  } = component.props || {};

  const children = (component.children || []).slice(0, 2);
  const [firstRatio, secondRatio] = ratioMap[ratio] || ratioMap['1:1'];
  const orderedChildren = reversed ? [...children].reverse() : children;
  const template = reversed
    ? `${secondRatio} ${firstRatio}`
    : `${firstRatio} ${secondRatio}`;

  const style: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: template,
    gap: gapMap[gap],
  };

  const classes = clsx(
    're-split',
    vertical && 're-split-vertical'
  );

  return (
    <div className={classes} style={style}>
      {orderedChildren.map((child, index) => (
        <div
          key={child?.id || index}
          className={clsx(
            're-split-pane',
            index === 0 ? 're-split-left' : 're-split-right'
          )}
        >
          {child && <ComponentRenderer component={child} onAction={onAction} />}
        </div>
      ))}
    </div>
  );
}
