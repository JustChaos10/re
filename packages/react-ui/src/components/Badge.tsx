import React from 'react';
import clsx from 'clsx';
import { BadgeComponent } from '@re/core';

export function Badge({ props }: { props: BadgeComponent['props'] }) {
  const { label = 'Badge', variant = 'default' } = props;

  // Ensure label is not empty
  const badgeLabel = label && label.trim() !== '' ? label : 'Badge';

  return <span className={clsx('re-badge', `re-badge-${variant}`)}>{badgeLabel}</span>;
}
