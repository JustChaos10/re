import React from 'react';
import { Icon } from './Icon';

export interface TagGroupProps {
  props: {
    tags: Array<{
      id: string;
      label: string;
      variant?: 'default' | 'primary' | 'success' | 'warning' | 'error';
      removable?: boolean;
    }>;
    size?: 'sm' | 'md';
  };
  onAction?: (actionId: string, data?: any) => void;
}

export function TagGroup({ props, onAction }: TagGroupProps) {
  const { tags, size = 'sm' } = props;

  const handleRemove = (tagId: string) => {
    onAction?.('tag-remove', { tagId });
  };

  return (
    <div className={`re-tag-group re-tag-group-${size}`}>
      {tags.map((tag) => (
        <span 
          key={tag.id} 
          className={`re-tag re-tag-${tag.variant || 'default'}`}
        >
          <span className="re-tag-label">{tag.label}</span>
          {tag.removable && (
            <button 
              className="re-tag-remove" 
              onClick={() => handleRemove(tag.id)}
              aria-label={`Remove ${tag.label}`}
            >
              <Icon props={{ name: 'x', size: 'xs', color: 'currentColor' }} />
            </button>
          )}
        </span>
      ))}
    </div>
  );
}
