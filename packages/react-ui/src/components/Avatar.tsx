import React from 'react';

export interface AvatarProps {
  props: {
    src?: string;
    name: string;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    status?: 'online' | 'offline' | 'busy' | 'away';
  };
}

const sizeMap = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 56,
  xl: 80,
};

const statusColors: Record<string, string> = {
  online: 'var(--re-success)',
  offline: 'var(--re-text-tertiary)',
  busy: 'var(--re-error)',
  away: 'var(--re-warning)',
};

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

function stringToColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = hash % 360;
  return `hsl(${hue}, 65%, 50%)`;
}

export function Avatar({ props }: AvatarProps) {
  const { src, name, size = 'md', status } = props;
  const dimension = sizeMap[size];
  const initials = getInitials(name);
  const bgColor = stringToColor(name);

  const containerStyle: React.CSSProperties = {
    position: 'relative',
    display: 'inline-flex',
    width: dimension,
    height: dimension,
  };

  const avatarStyle: React.CSSProperties = {
    width: dimension,
    height: dimension,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: dimension * 0.4,
    fontWeight: 600,
    color: 'white',
    backgroundColor: bgColor,
    overflow: 'hidden',
  };

  const statusSize = Math.max(8, dimension * 0.25);
  const statusStyle: React.CSSProperties = {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: statusSize,
    height: statusSize,
    borderRadius: '50%',
    backgroundColor: status ? statusColors[status] : 'transparent',
    border: '2px solid var(--re-bg-primary)',
  };

  return (
    <div className="re-avatar" style={containerStyle} title={name}>
      <div className="re-avatar-inner" style={avatarStyle}>
        {src ? (
          <img 
            src={src} 
            alt={name} 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <span>{initials}</span>
        )}
      </div>
      {status && <div className="re-avatar-status" style={statusStyle} />}
    </div>
  );
}
