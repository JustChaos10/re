import React from 'react';
import clsx from 'clsx';
import { Component } from '@re/core';
import { ComponentRenderer } from '../renderer';

export interface StackProps {
  component: {
    id: string;
    props?: {
      gap?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
      align?: 'start' | 'center' | 'end' | 'stretch';
      dividers?: boolean;
    };
    children?: Component[];
  };
  onAction?: (actionId: string, data?: any) => void;
}

const alignMap = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  stretch: 'stretch',
};

export function Stack({ component, onAction }: StackProps) {
  const { gap = 'md', align = 'stretch', dividers = false } = component.props || {};
  const children = component.children || [];

  const style: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: `var(--gap-${gap})`,
    alignItems: alignMap[align],
  };

  return (
    <div className={clsx('re-stack', dividers && 're-stack-dividers')} style={style}>
      {children.map((child, index) => (
        <React.Fragment key={child.id}>
          {dividers && index > 0 && <div className="re-stack-divider" />}
          <div className="re-stack-item">
            <ComponentRenderer component={child} onAction={onAction} />
          </div>
        </React.Fragment>
      ))}
    </div>
  );
}
