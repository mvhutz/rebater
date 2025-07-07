import React from 'react';

/** ------------------------------------------------------------------------- */

interface DiscrepancyTableProps {
  data: RunResults;
}

function DiscrepancyTable(props: DiscrepancyTableProps) {
  const { data } = props;

  return (
    <table>
      <thead>
        <tr>
          <th>Supplier ID</th>
          <th>Drop</th>
          <th>Take</th>
        </tr>
      </thead>
      <tbody>
        {data.discrepency.map(r => <tr key={r.name}>
          <td>{r.name}</td>
          <td>
            <code style={{ whiteSpace: "pre", color: "red" }}>
              {r.drop.join("\n")}
            </code>
          </td>
          <td>
            <code style={{ whiteSpace: "pre", color: "green" }}>
              {r.take.join("\n")}
            </code>
          </td>
        </tr>)}
      </tbody>
    </table>
  );
}

/** ------------------------------------------------------------------------- */

export default React.memo(DiscrepancyTable);
