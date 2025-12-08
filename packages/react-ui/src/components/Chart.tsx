import React from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { ChartComponent } from '@re/core';

const COLORS = ['#0066ff', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6'];

// Enhanced tooltip component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="re-chart-tooltip">
      <div className="re-chart-tooltip-label">{label}</div>
      {payload.map((entry: any, index: number) => (
        <div key={index} className="re-chart-tooltip-item">
          <span
            className="re-chart-tooltip-color"
            style={{ backgroundColor: entry.color || entry.fill }}
          />
          <span className="re-chart-tooltip-name">{entry.name || entry.dataKey}:</span>
          <span className="re-chart-tooltip-value">{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

export function Chart({ props }: { props?: ChartComponent['props'] }) {
  const {
    chartType = 'line',
    data = [],
    xKey = 'name',
    yKey = 'value',
    title,
  } = props ?? ({} as ChartComponent['props']);

  const renderChart = () => {
    switch (chartType) {
      case 'line':
        return (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--re-border)" />
            <XAxis dataKey={xKey} stroke="var(--re-text-secondary)" />
            <YAxis stroke="var(--re-text-secondary)" />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line
              type="monotone"
              dataKey={yKey}
              stroke="var(--re-primary)"
              strokeWidth={2.5}
              dot={{ r: 4, strokeWidth: 2, fill: 'var(--re-bg-primary)', stroke: 'var(--re-primary)' }}
              activeDot={{ r: 6, strokeWidth: 0, fill: 'var(--re-primary)' }}
            />
          </LineChart>
        );

      case 'bar':
        return (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--re-border)" />
            <XAxis dataKey={xKey} stroke="var(--re-text-secondary)" />
            <YAxis stroke="var(--re-text-secondary)" />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey={yKey} radius={[4, 4, 0, 0]} maxBarSize={60}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        );

      case 'pie':
        return (
          <PieChart>
            <Pie
              data={data}
              dataKey={yKey}
              nameKey={xKey}
              cx="50%"
              cy="50%"
              outerRadius={80}
              label
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend />
          </PieChart>
        );

      case 'area':
        return (
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--re-border)" />
            <XAxis dataKey={xKey} stroke="var(--re-text-secondary)" />
            <YAxis stroke="var(--re-text-secondary)" />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Area
              type="monotone"
              dataKey={yKey}
              stroke="var(--re-primary)"
              strokeWidth={2}
              fill="var(--re-primary-light)"
            />
          </AreaChart>
        );

      default:
        return null;
    }
  };

  const chart = renderChart();

  if (!chart) {
    return (
      <div style={{ width: '100%' }}>
        {title && <h3 className="re-card-title">{title}</h3>}
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--re-text-secondary)' }}>
          Unsupported chart type: {chartType}
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: '100%' }}>
      {title && <h3 className="re-card-title">{title}</h3>}
      <ResponsiveContainer width="100%" height={300}>
        {chart}
      </ResponsiveContainer>
    </div>
  );
}
