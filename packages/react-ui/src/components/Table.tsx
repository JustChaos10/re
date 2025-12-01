import React from 'react';
import clsx from 'clsx';
import { TableComponent } from '@re/core';

export function Table({ props }: { props: TableComponent['props'] }) {
  const { headers = [], rows = [], striped } = props;

  // Handle empty table
  if (headers.length === 0 && rows.length === 0) {
    return (
      <div className="re-table-container">
        <div className="re-table-empty" style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
          No data available
        </div>
      </div>
    );
  }

  return (
    <div className="re-table-container">
      <table className={clsx('re-table', striped && 're-table-striped')}>
        {headers.length > 0 && (
          <thead>
            <tr>
              {headers.map((header, idx) => (
                <th key={idx}>{header}</th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {rows.length > 0 ? (
            rows.map((row, rowIdx) => (
              <tr key={rowIdx}>
                {headers.map((header, colIdx) => (
                  <td key={colIdx}>{row[header] ?? '-'}</td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={headers.length} style={{ textAlign: 'center', padding: '1rem', color: '#666' }}>
                No rows to display
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
