import React from 'react';
import { useAppSelector } from '../../../store/hooks';
import { getRunResults } from '../../../store/slices/system';
import AnalysisAccordion from '../AnalysisAccordion';
import NotificationsPausedRoundedIcon from '@mui/icons-material/NotificationsPausedRounded';
import { Chip, Table } from '@mui/joy';

/** ------------------------------------------------------------------------- */

function IgnoredRowCard() {
  const results = useAppSelector(getRunResults);
  if (results == null) return;

  const { issues: { ignored_row } } = results

  return (
    <AnalysisAccordion
      disabled={ignored_row.length === 0}
      amount={ignored_row.length}
      color="danger"
      title="Ignored Rows"
      subtitle="During execution, these rows where omitted from the output data. If these rows do contain data, you may have to omdify the transformers."
      icon={<NotificationsPausedRoundedIcon />}>
      <Table size='md' color="neutral" variant="outlined" sx={{ mt: 2, borderRadius: "sm" }} borderAxis="bothBetween">
        <thead>
          <tr>
            <th>Transformer</th>
            <th>Error</th>
            <th>Source</th>
          </tr>
        </thead>
        <tbody>
          {ignored_row.map((i, index) => <tr key={index}>
            <td><Chip variant="soft" color="primary">{i.transformer}</Chip></td>
            <td>{i.reason}</td>
            <td><code>{i.source}</code></td>
          </tr>)}
        </tbody>
      </Table>
    </AnalysisAccordion>
  );
}

/** ------------------------------------------------------------------------- */

export default React.memo(IgnoredRowCard);
