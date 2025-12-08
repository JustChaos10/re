import React from 'react';
import clsx from 'clsx';
import { Component } from '@re/core';
import { ComponentRenderer } from '../renderer';

export interface SectionProps {
  component: {
    id: string;
    props?: {
      title?: string;
      subtitle?: string;
      variant?: 'default' | 'card' | 'highlighted' | 'bordered';
      padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
      background?: 'none' | 'subtle' | 'muted' | 'accent';
    };
    children?: Component[];
  };
  onAction?: (actionId: string, data?: any) => void;
}

const paddingMap = {
  none: 'var(--padding-none)',
  sm: 'var(--padding-sm)',
  md: 'var(--padding-md)',
  lg: 'var(--padding-lg)',
  xl: 'var(--padding-xl)',
};

export function Section({ component, onAction }: SectionProps) {
  const { 
    title, 
    subtitle, 
    variant = 'default', 
    padding = 'lg',
    background = 'none' 
  } = component.props || {};
  
  const children = component.children || [];

  const classes = clsx(
    're-section',
    `re-section-${variant}`,
    `re-section-bg-${background}`
  );

  const style: React.CSSProperties = {
    padding: paddingMap[padding],
  };

  return (
    <section className={classes} style={style}>
      {(title || subtitle) && (
        <div className="re-section-header">
          {title && <h2 className="re-section-title">{title}</h2>}
          {subtitle && <p className="re-section-subtitle">{subtitle}</p>}
        </div>
      )}
      <div className="re-section-content">
        {children.map((child) => (
          <ComponentRenderer key={child.id} component={child} onAction={onAction} />
        ))}
      </div>
    </section>
  );
}
