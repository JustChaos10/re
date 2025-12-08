import React from 'react';
import { Component } from '@re/core';
import { ComponentRenderer } from '../renderer';
import { Icon } from './Icon';

export interface CalloutProps {
  component?: {
    id: string;
    props?: {
      title?: string;
      message?: string;
      variant?: 'info' | 'success' | 'warning' | 'error' | 'tip' | 'note';
      icon?: string;
      collapsible?: boolean;
    };
    children?: Component[];
  };
  onAction?: (actionId: string, data?: any) => void;
}

const variantIcons: Record<string, string> = {
  info: 'info',
  success: 'check-circle',
  warning: 'alert-triangle',
  error: 'x-circle',
  tip: 'lightbulb',
  note: 'file-text',
};

const variantColors: Record<string, string> = {
  info: 'info',
  success: 'success',
  warning: 'warning',
  error: 'error',
  tip: 'primary',
  note: 'secondary',
};

export function Callout({ component, onAction }: CalloutProps) {
  const [isOpen, setIsOpen] = React.useState(true);
  const safeComponent = component ?? { id: 'callout', props: {} };
  const { 
    title, 
    message = 'Note', 
    variant = 'info', 
    icon, 
    collapsible = false 
  } = safeComponent.props ?? {};
  
  const children = safeComponent.children || [];
  const iconName = icon || variantIcons[variant];
  const iconColor = variantColors[variant];

  const classes = [
    're-callout',
    `re-callout-${variant}`,
  ].join(' ');

  const handleToggle = () => {
    if (collapsible) {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div className={classes}>
      <div className="re-callout-header" onClick={handleToggle} style={{ cursor: collapsible ? 'pointer' : 'default' }}>
        <div className="re-callout-icon">
          <Icon props={{ name: iconName, size: 'md', color: iconColor }} />
        </div>
        <div className="re-callout-content">
          {title && <div className="re-callout-title">{title}</div>}
          <div className="re-callout-message">{message}</div>
        </div>
        {collapsible && (
          <div className="re-callout-toggle">
            <Icon props={{ name: isOpen ? 'chevron-up' : 'chevron-down', size: 'sm', color: 'muted' }} />
          </div>
        )}
      </div>
      {isOpen && children.length > 0 && (
        <div className="re-callout-children">
          {children.map((child) => (
            <ComponentRenderer key={child.id} component={child} onAction={onAction} />
          ))}
        </div>
      )}
    </div>
  );
}
