import React from 'react';
import clsx from 'clsx';
import { ButtonComponent } from '@re/core';

export interface ButtonProps {
  props: ButtonComponent['props'];
  onAction?: (actionId: string) => void;
}

export function Button({ props, onAction }: ButtonProps) {
  const { label = 'Button', variant = 'primary', size = 'md', onClick, disabled } = props;

  const handleClick = () => {
    if (onClick && onAction) {
      onAction(onClick);
    }
  };

  // Ensure label is not empty
  const buttonLabel = label && label.trim() !== '' ? label : 'Button';

  return (
    <button
      className={clsx('re-button', `re-button-${variant}`, `re-button-${size}`)}
      onClick={handleClick}
      disabled={disabled}
    >
      {buttonLabel}
    </button>
  );
}
