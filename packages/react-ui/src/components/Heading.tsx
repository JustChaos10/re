import React from 'react';
import clsx from 'clsx';
import { HeadingComponent } from '@re/core';

export function Heading({ props }: { props: HeadingComponent['props'] }) {
  const { content = 'Heading', level = 2 } = props;
  const Tag = `h${level}` as keyof JSX.IntrinsicElements;

  // Ensure content is not empty
  const headingContent = content && content.trim() !== '' ? content : 'Heading';

  return <Tag className={clsx('re-heading', `re-heading-${level}`)}>{headingContent}</Tag>;
}
