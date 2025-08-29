import Table from '@mui/joy/Table';
import SpeedIcon from '@mui/icons-material/Speed';
import React from 'react';
import { useAppSelector } from '../../../store/hooks';
import { getRunResults } from '../../../store/slices/system';
import AnalysisAccordion from '../AnalysisAccordion';

/** ------------------------------------------------------------------------- */

function PerformanceCard() {
  const results = useAppSelector(getRunResults);
  if (results == null) return;

  console.log(results.performance);

  return (
    <AnalysisAccordion disabled={results.performance.length === 0} amount={results.performance.length} title="Performance" color="success" subtitle="View similarity to expected results." icon={<SpeedIcon />}>
      <Table size='sm' color="neutral" variant="outlined" sx={{ mt: 2, borderRadius: "sm", overflow: "hidden" }}>
        <thead>
          <tr>
            <th>Supplier</th>
            <th>Time (ms)</th>
          </tr>
        </thead>
        <tbody>
          {results.performance.map(r => <tr key={r.name}>
            <td>{r.name}</td>
            <td>{Math.round(r.end - r.start)}</td>
          </tr>)}
        </tbody>
      </Table>
    </AnalysisAccordion>
  );
}

/** ------------------------------------------------------------------------- */

export default React.memo(PerformanceCard);
