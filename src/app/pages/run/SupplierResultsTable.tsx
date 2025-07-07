import React from 'react';

/** ------------------------------------------------------------------------- */

interface SupplerResultsTableProps {
  data: RunResults;
}

function SupplerResultsTable(props: SupplerResultsTableProps) {
  const { data } = props;

  return (
    <table>
      <thead>
        <tr>
          <th>Supplier</th>
          <th>Time (ms)</th>
        </tr>
      </thead>
      <tbody>
        { data.config.map(r => <tr key={r.name}>
          <td>{r.name}</td>
          <td>{Math.round(r.end - r.start)}</td>
        </tr>) }
      </tbody>
    </table>
  );
}

/** ------------------------------------------------------------------------- */

export default React.memo(SupplerResultsTable);
