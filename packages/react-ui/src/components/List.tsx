import React from 'react';
import clsx from 'clsx';
import { ListComponent } from '@re/core';
import { Icon } from './Icon';

export function List({ props }: { props?: ListComponent['props'] }) {
  const { items = [], variant = 'none' } = props ?? ({} as ListComponent['props']);

  const className = clsx(
    're-list',
    variant === 'bullet' && 're-list-bullet',
    variant === 'numbered' && 're-list-numbered'
  );

  return (
    <ul className={className}>
      {items.map((item, idx) => (
        <li key={item.id ?? idx} className="re-list-item">
          {item.icon && (
            <span className="re-list-item-icon">
              <Icon props={{ name: item.icon, size: 'sm', color: 'muted' }} />
            </span>
          )}
          <div className="re-list-item-content">
            <span className="re-list-item-label">{item.label ?? 'Item'}</span>
            {item.description && (
              <span className="re-list-item-description">{item.description}</span>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
