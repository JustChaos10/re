import React from 'react';
import clsx from 'clsx';
import { TextComponent } from '@re/core';

export function Text({ props }: { props: TextComponent['props'] }) {
  const { content = 'Text', size = 'md', weight = 'normal', color } = props;

  // Ensure content is not empty
  const textContent = content && content.trim() !== '' ? content : 'Text';

  return (
    <p
      className={clsx('re-text', `re-text-${size}`, `re-text-${weight}`)}
      style={color ? { color } : undefined}
    >
      {textContent}
    </p>
  );
}
