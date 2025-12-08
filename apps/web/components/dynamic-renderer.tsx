'use client';

import type { ComponentNode } from '@/lib/schema';
import React from 'react';

type DynamicRendererProps = {
  components: ComponentNode[];
};

export function DynamicRenderer({ components }: DynamicRendererProps) {
  if (!components?.length) {
    return (
      <div style={emptyStateStyle}>
        <p style={{ fontSize: '0.95rem', color: '#5f6c8d' }}>
          Generated layouts will appear here once Gemini produces a component plan.
        </p>
      </div>
    );
  }

  return (
    <div style={stackStyle}>
      {components.map((component, index) => (
        <React.Fragment key={component.id ?? `${component.type}-${index}`}>
          {renderNode(component)}
        </React.Fragment>
      ))}
    </div>
  );
}

function renderNode(node: ComponentNode): React.ReactNode {
  switch (node.type) {
    case 'Header':
      return (
        <header style={headerStyle}>
          <p style={eyebrowStyle}>System Response</p>
          <h1 style={h1Style}>{node.props.title}</h1>
          {node.props.subtitle && <p style={leadStyle}>{node.props.subtitle}</p>}
        </header>
      );
    case 'AnalysisText':
    case 'TextBlock':
      return (
        <p style={bodyTextStyle}>
          {node.props.title && <strong style={{ display: 'block', marginBottom: 4 }}>{node.props.title}</strong>}
          {node.props.content}
        </p>
      );
    case 'StockCard':
      return (
        <div style={cardStyle}>
          <div style={cardHeaderStyle}>
            <span style={symbolStyle}>{node.props.symbol}</span>
            <span style={priceStyle}>${node.props.price.toFixed(2)}</span>
          </div>
          <div style={trendStyle(node.props.changeDirection)}>
            {node.props.changeDirection === 'up' ? '▲' : '▼'} {Math.abs(node.props.change).toFixed(2)}%
          </div>
          {node.props.summary && <p style={cardSummaryStyle}>{node.props.summary}</p>}
        </div>
      );
    case 'WeatherWidget':
      return (
        <div style={{ ...cardStyle, background: 'linear-gradient(135deg,#9fd3ff,#bdd5ff)' }}>
          <p style={{ ...eyebrowStyle, color: '#0f172a' }}>{node.props.location}</p>
          <p style={{ fontSize: '2.75rem', margin: '0 0 0.25rem', color: '#0f172a' }}>
            {Math.round(node.props.temperature)}°C
          </p>
          <p style={{ ...bodyTextStyle, color: '#0f172a' }}>{node.props.condition}</p>
          <p style={{ ...bodyTextStyle, color: '#0f172a' }}>
            H {node.props.high ?? '—'}° · L {node.props.low ?? '—'}°
          </p>
        </div>
      );
    case 'InfoCard':
      return (
        <div style={cardStyle}>
          <p style={eyebrowStyle}>{node.props.title}</p>
          <p style={statStyle}>{node.props.stat}</p>
          {node.props.trend && <p style={trendPillStyle(node.props.variant ?? 'neutral')}>{node.props.trend}</p>}
          {node.props.description && <p style={cardSummaryStyle}>{node.props.description}</p>}
        </div>
      );
    case 'Alert':
      return (
        <div style={{ ...alertStyle, borderColor: variantColor(node.props.variant), color: variantColor(node.props.variant) }}>
          <p style={{ margin: 0, fontWeight: 600 }}>{node.props.title ?? node.props.variant?.toUpperCase()}</p>
          <p style={{ margin: '4px 0 0' }}>{node.props.message}</p>
          {node.props.actionLabel && (
            <button type=\"button\" style={ghostButtonStyle(variantColor(node.props.variant))}>
              {node.props.actionLabel}
            </button>
          )}
        </div>
      );
    case 'ComparisonRow':
      return (
        <div style={comparisonStyle}>
          {node.props.title && <p style={{ ...eyebrowStyle, marginBottom: 8 }}>{node.props.title}</p>}
          <div style={comparisonGridStyle(node.props.items.length)}>
            {node.props.items.map((item) => (
              <div key={item.label} style={comparisonCardStyle}>
                <p style={eyebrowStyle}>{item.label}</p>
                <p style={statStyle}>{item.value}</p>
                {item.detail && <p style={cardSummaryStyle}>{item.detail}</p>}
              </div>
            ))}
          </div>
        </div>
      );
    case 'MetricList':
      return (
        <div style={cardStyle}>
          {node.props.title && <p style={eyebrowStyle}>{node.props.title}</p>}
          <ul style={metricListStyle}>
            {node.props.items.map((item) => (
              <li key={item.label} style={metricListItemStyle}>
                <div>
                  <p style={{ ...bodyTextStyle, marginBottom: 2 }}>{item.label}</p>
                  {item.delta && <span style={mutedTextStyle}>{item.delta}</span>}
                </div>
                <span style={statStyle}>{item.value}</span>
              </li>
            ))}
          </ul>
        </div>
      );
    case 'LayoutRow':
      return (
        <div style={rowStyle(node.props.gap, node.props.columns)}>
          {node.children?.map((child, index) => (
            <div key={child.id ?? `${child.type}-${index}`} style={{ minWidth: 0 }}>
              {renderNode(child)}
            </div>
          ))}
        </div>
      );
    case 'LayoutColumn':
      return (
        <div style={columnStyle(node.props.gap)}>
          {node.children?.map((child, index) => (
            <div key={child.id ?? `${child.type}-${index}`} style={{ width: '100%' }}>
              {renderNode(child)}
            </div>
          ))}
        </div>
      );
    case 'Section':
      return (
        <section style={sectionStyle}>
          {node.props.title && <h2 style={sectionTitleStyle}>{node.props.title}</h2>}
          {node.props.description && <p style={sectionDescriptionStyle}>{node.props.description}</p>}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {node.children?.map((child, index) => (
              <div key={child.id ?? `${child.type}-${index}`}>{renderNode(child)}</div>
            ))}
          </div>
        </section>
      );
    case 'Divider':
      return (
        <div style={dividerWrapper}>
          <span style={dividerLine} />
          {node.props.label && <span style={dividerLabel}>{node.props.label}</span>}
          <span style={dividerLine} />
        </div>
      );
    case 'KeyTakeaways':
      return (
        <div style={keyTakeawaysStyle}>
          {node.props.title && <p style={eyebrowStyle}>{node.props.title}</p>}
          <div style={takeawaysGridStyle}>
            {node.props.items.map((item) => (
              <div key={item.label} style={takeawayCardStyle}>
                <div style={takeawayIcon(item.trend)} />
                <p style={{ margin: '0 0 4px', fontWeight: 600 }}>{item.label}</p>
                {item.caption && <p style={mutedTextStyle}>{item.caption}</p>}
              </div>
            ))}
          </div>
        </div>
      );
    case 'InsightCard':
      return (
        <div style={{ ...cardStyle, borderColor: toneColor(node.props.tone) }}>
          <p style={eyebrowStyle}>{node.props.title}</p>
          <p style={bodyTextStyle}>{node.props.description}</p>
          {node.props.metric && <p style={statStyle}>{node.props.metric}</p>}
        </div>
      );
    case 'TimelineComparison':
      return (
        <div style={timelineStyle}>
          {node.props.title && <p style={sectionTitleStyle}>{node.props.title}</p>}
          <div style={timelineGridStyle}>
            {node.props.eras.map((era) => (
              <div key={era.era} style={timelineColumnStyle}>
                <p style={timelineEraStyle}>{era.era}</p>
                <ul style={timelineListStyle}>
                  {era.bullets.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      );
    case 'RelatedQueries':
      return (
        <div style={cardStyle}>
          <p style={eyebrowStyle}>{node.props.title ?? 'Related queries'}</p>
          <ul style={relatedListStyle}>
            {node.props.queries.map((query) => (
              <li key={query.prompt} style={relatedItemStyle}>
                <span>{query.prompt}</span>
                {query.description && <p style={mutedTextStyle}>{query.description}</p>}
              </li>
            ))}
          </ul>
        </div>
      );
    default:
      return null;
  }
}

const emptyStateStyle: React.CSSProperties = {
  padding: '1.5rem',
  border: '1px dashed #cfd7f0',
  borderRadius: 16,
  background: '#fff',
};

const stackStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1.25rem',
};

const headerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.35rem',
};

const eyebrowStyle: React.CSSProperties = {
  fontSize: '0.75rem',
  letterSpacing: '0.05em',
  textTransform: 'uppercase',
  color: '#7c8dab',
  margin: 0,
};

const h1Style: React.CSSProperties = {
  fontSize: '2rem',
  fontWeight: 600,
  margin: 0,
  color: '#0b1221',
};

const leadStyle: React.CSSProperties = {
  fontSize: '1rem',
  margin: 0,
  color: '#4b5674',
};

const bodyTextStyle: React.CSSProperties = {
  fontSize: '0.95rem',
  color: '#1f2b45',
  lineHeight: 1.5,
  margin: 0,
};

const cardStyle: React.CSSProperties = {
  border: '1px solid #dce4ff',
  borderRadius: 20,
  padding: '1.25rem',
  background: '#fff',
  boxShadow: '0 12px 30px rgba(15, 23, 42, 0.08)',
};

const cardHeaderStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 8,
};

const symbolStyle: React.CSSProperties = {
  fontWeight: 600,
  color: '#1e2865',
};

const priceStyle: React.CSSProperties = {
  fontSize: '1.75rem',
  fontWeight: 600,
  color: '#0b1221',
};

const cardSummaryStyle: React.CSSProperties = {
  fontSize: '0.9rem',
  color: '#5d6789',
  margin: 0,
};

const statStyle: React.CSSProperties = {
  fontSize: '1.5rem',
  fontWeight: 600,
  margin: '0.2rem 0',
  color: '#0f172a',
};

const alertStyle: React.CSSProperties = {
  borderRadius: 16,
  borderWidth: 1,
  borderStyle: 'solid',
  padding: '1rem 1.25rem',
  background: '#fff',
  boxShadow: '0 10px 24px rgba(15, 23, 42, 0.05)',
};

const trendPillStyle = (variant: string): React.CSSProperties => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: 4,
  padding: '0.25rem 0.75rem',
  fontSize: '0.85rem',
  borderRadius: 999,
  background: `${variantColor(variant)}15`,
  color: variantColor(variant),
});

const trendStyle = (direction: 'up' | 'down'): React.CSSProperties => ({
  fontSize: '1rem',
  fontWeight: 600,
  marginBottom: 8,
  color: direction === 'up' ? '#0ea76a' : '#d55656',
});

const variantColor = (variant?: string): string => {
  switch (variant) {
    case 'success':
    case 'up':
      return '#0ea76a';
    case 'warning':
      return '#d97706';
    case 'error':
    case 'danger':
    case 'down':
      return '#d55656';
    default:
      return '#2563eb';
  }
};

const ghostButtonStyle = (color: string): React.CSSProperties => ({
  marginTop: 8,
  padding: '0.35rem 0.75rem',
  borderRadius: 999,
  border: `1px solid ${color}`,
  background: 'transparent',
  color,
  fontSize: '0.85rem',
});

const comparisonStyle: React.CSSProperties = {
  border: '1px solid #dfe6ff',
  borderRadius: 24,
  padding: '1rem',
  background: '#f7f9ff',
};

const comparisonGridStyle = (count: number): React.CSSProperties => ({
  display: 'grid',
  gridTemplateColumns: `repeat(${Math.min(count, 3)}, minmax(0, 1fr))`,
  gap: '0.75rem',
});

const comparisonCardStyle: React.CSSProperties = {
  borderRadius: 16,
  padding: '0.75rem 1rem',
  background: '#fff',
  border: '1px solid #e1e8ff',
};

const metricListStyle: React.CSSProperties = {
  listStyle: 'none',
  padding: 0,
  margin: '0.5rem 0 0',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.35rem',
};

const metricListItemStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '0.35rem 0',
  borderBottom: '1px solid #eef1ff',
};

const mutedTextStyle: React.CSSProperties = {
  fontSize: '0.8rem',
  color: '#8a94b7',
};

const rowStyle = (gap: 'sm' | 'md' | 'lg', columns: number): React.CSSProperties => ({
  display: 'grid',
  gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
  gap: gapValue(gap),
});

const columnStyle = (gap: 'sm' | 'md' | 'lg'): React.CSSProperties => ({
  display: 'flex',
  flexDirection: 'column',
  gap: gapValue(gap),
});

const sectionStyle: React.CSSProperties = {
  border: '1px solid #dfe3f8',
  borderRadius: 28,
  padding: '1.25rem',
  background: '#fff',
};

const sectionTitleStyle: React.CSSProperties = {
  margin: '0 0 0.35rem',
  fontSize: '1.35rem',
  color: '#101632',
};

const sectionDescriptionStyle: React.CSSProperties = {
  margin: '0 0 1rem',
  fontSize: '0.95rem',
  color: '#5a6486',
};

const dividerWrapper: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
};

const dividerLine: React.CSSProperties = {
  flex: 1,
  height: 1,
  background: '#d7ddf1',
};

const dividerLabel: React.CSSProperties = {
  fontSize: '0.75rem',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  color: '#8a94b7',
};

const keyTakeawaysStyle: React.CSSProperties = {
  borderRadius: 24,
  border: '1px solid #dce2ff',
  padding: '1.25rem',
  background: '#f9faff',
};

const takeawaysGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
  gap: '0.75rem',
};

const takeawayCardStyle: React.CSSProperties = {
  borderRadius: 18,
  background: '#fff',
  border: '1px solid #e3e9ff',
  padding: '0.75rem 1rem',
};

const takeawayIcon = (trend?: 'up' | 'down' | 'steady'): React.CSSProperties => ({
  width: 32,
  height: 8,
  borderRadius: 999,
  background:
    trend === 'up'
      ? 'linear-gradient(90deg,#34d399,#10b981)'
      : trend === 'down'
        ? 'linear-gradient(90deg,#f87171,#ef4444)'
        : 'linear-gradient(90deg,#c7d2fe,#a5b4fc)',
  marginBottom: 10,
});

const toneColor = (tone?: string) => {
  switch (tone) {
    case 'success':
      return '#10b981';
    case 'warning':
      return '#d97706';
    case 'danger':
      return '#ef4444';
    default:
      return '#2563eb';
  }
};

const timelineStyle: React.CSSProperties = {
  borderRadius: 24,
  border: '1px solid #dfe6ff',
  padding: '1.5rem',
  background: '#fff',
};

const timelineGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
  gap: '1rem',
};

const timelineColumnStyle: React.CSSProperties = {
  borderRadius: 20,
  border: '1px solid #e4e9ff',
  padding: '1rem',
  background: '#f5f7ff',
};

const timelineEraStyle: React.CSSProperties = {
  fontWeight: 600,
  color: '#111c48',
  margin: '0 0 0.5rem',
};

const timelineListStyle: React.CSSProperties = {
  margin: 0,
  paddingLeft: '1.1rem',
  color: '#35405f',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.35rem',
};

const relatedListStyle: React.CSSProperties = {
  listStyle: 'none',
  margin: '0.5rem 0 0',
  padding: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
};

const relatedItemStyle: React.CSSProperties = {
  paddingBottom: '0.5rem',
  borderBottom: '1px solid #eef1ff',
  fontWeight: 500,
  color: '#111c48',
};

const gapValue = (gap: 'sm' | 'md' | 'lg') => {
  switch (gap) {
    case 'sm':
      return '0.75rem';
    case 'lg':
      return '2rem';
    default:
      return '1.25rem';
  }
};
