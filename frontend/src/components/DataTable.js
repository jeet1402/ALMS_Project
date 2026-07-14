import React, { useState, useEffect } from 'react';

const DataTable = ({ columns, data, pageSize = 5, emptyMessage = 'No data found.' }) => {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(data.length / pageSize));

  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [data.length, totalPages, page]);

  const startIdx = (page - 1) * pageSize;
  const pageRows = data.slice(startIdx, startIdx + pageSize);
  const padCount = pageRows.length > 0 ? pageSize - pageRows.length : 0;

  return (
    <div className="data-table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key} style={col.width ? { width: col.width } : undefined}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {pageRows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="empty-cell">{emptyMessage}</td>
            </tr>
          ) : (
            pageRows.map((row, i) => (
              <tr key={row.id ?? i}>
                {columns.map((col) => (
                  <td key={col.key}>{col.render ? col.render(row) : row[col.key]}</td>
                ))}
              </tr>
            ))
          )}
          {Array.from({ length: padCount }).map((_, i) => (
            <tr key={`pad-${i}`} className="pad-row">
              {columns.map((col) => <td key={col.key}>&nbsp;</td>)}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="pagination">
        <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
          Prev
        </button>
        <span>Page {page} of {totalPages}</span>
        <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
          Next
        </button>
      </div>
    </div>
  );
};

export default DataTable;
