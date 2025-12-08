import React from 'react';
import { Icon } from './Icon';

export interface StatProps {
  props?: {
    label?: string;
    value?: string | number;
    change?: {
      value: string | number;
      type: 'increase' | 'decrease' | 'neutral';
    };
    icon?: string;
    description?: string;
  };
}

const changeIcons: Record<string, string> = {
  increase: 'trending-up',
  decrease: 'trending-down',
  neutral: 'minus',
};

const changeColors: Record<string, string> = {
  increase: 'success',
  decrease: 'error',
  neutral: 'muted',
};

export function Stat({ props }: StatProps) {
  const safeProps = props ?? {};
  const { label = 'Stat', value = '--', change, icon, description } = safeProps;

  return (
    <div className="re-stat">
      <div className="re-stat-header">
        {icon && (
          <div className="re-stat-icon">
            <Icon props={{ name: icon, size: 'md', color: 'muted' }} />
          </div>
        )}
        <div className="re-stat-label">{label}</div>
      </div>
      <div className="re-stat-value">{value}</div>
      {change && (
        <div className={`re-stat-change re-stat-change-${change.type}`}>
          <Icon props={{ name: changeIcons[change.type], size: 'xs', color: changeColors[change.type] }} />
          <span>{change.value}</span>
        </div>
      )}
      {description && <div className="re-stat-description">{description}</div>}
    </div>
  );
}
