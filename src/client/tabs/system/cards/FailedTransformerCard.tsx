import React from 'react';
import { useAppSelector } from '../../../store/hooks';
import { getRunResults } from '../../../store/slices/system';
import AnalysisAccordion from '../AnalysisAccordion';
import FlashOffRoundedIcon from '@mui/icons-material/FlashOffRounded';
import { Chip, Table } from '@mui/joy';

/** ------------------------------------------------------------------------- */

function FailedTransformerCard() {
  const results = useAppSelector(getRunResults);
  if (results == null) return;

  const { issues: { failed_transformer } } = results

  return (
    <AnalysisAccordion
      disabled={failed_transformer.length === 0}
      amount={failed_transformer.length}
      color="danger"
      title="Failed Transformers"
      subtitle="These transformers encountered as error during execution. Resolve these issues to complete their extraction."
      icon={<FlashOffRoundedIcon />}>
      <Table size='md' color="neutral" variant="outlined" sx={{ mt: 2, borderRadius: "sm", tableLayout: "auto" }} borderAxis="bothBetween">
        <thead>
          <tr>
            <th>Transformer</th>
            <th>Error</th>
          </tr>
        </thead>
        <tbody>
          {failed_transformer.map((i, index) => <tr key={index}>
            <td><Chip variant="soft" color="primary">{i.transformer}</Chip></td>
            <td><code>{i.reason}</code></td>
          </tr>)}
        </tbody>
      </Table>
    </AnalysisAccordion>
  );
}

/** ------------------------------------------------------------------------- */

export default React.memo(FailedTransformerCard);
