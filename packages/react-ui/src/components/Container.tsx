import React from 'react';
import clsx from 'clsx';
import { ContainerComponent } from '@re/core';
import { ComponentRenderer } from '../renderer';

export interface ContainerProps {
  component: ContainerComponent;
  onAction?: (actionId: string) => void;
}

export function Container({ component, onAction }: ContainerProps) {
  const { children = [] } = component;
  const resolvedProps: NonNullable<ContainerComponent['props']> = component.props ?? {};
  const {
    direction = 'column',
    gap = 'md',
    align = 'stretch',
    justify = 'start',
    variant = 'flex',
    cols = 2,
    wrap = false,
    padding = 'none',
  } = resolvedProps;

  const safeCols = Math.max(1, cols || 1);
  const style: React.CSSProperties =
    variant === 'grid'
      ? {
          gridTemplateColumns: `repeat(${safeCols}, minmax(0, 1fr))`,
          gap: `var(--gap-${gap})`,
        }
      : {
          gap: `var(--gap-${gap})`,
        };

  return (
    <div
      className={clsx(
        're-container',
        variant === 'grid' ? 're-container-grid' : `re-container-${direction}`,
        `re-container-gap-${gap}`,
        `re-container-align-${align}`,
        `re-container-justify-${justify}`,
        variant === 'flex' && (wrap ? 're-container-wrap' : 're-container-nowrap'),
        padding && `re-p-${padding}`
      )}
      style={style}
    >
      {children.map((child) => (
        <ComponentRenderer key={child.id} component={child} onAction={onAction} />
      ))}
    </div>
  );
}
