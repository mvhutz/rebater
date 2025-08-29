import React from 'react';
import { useAppSelector } from '../../../store/hooks';
import { getRunResults } from '../../../store/slices/system';
import AnalysisAccordion from '../AnalysisAccordion';
import ImageNotSupportedRoundedIcon from '@mui/icons-material/ImageNotSupportedRounded';
import { Chip, Table } from '@mui/joy';

/** ------------------------------------------------------------------------- */

function EmptySourceCard() {
  const results = useAppSelector(getRunResults);
  if (results == null) return;

  const { issues: { empty_source } } = results
  return (
    <AnalysisAccordion
      disabled={empty_source.length === 0}
      amount={empty_source.length}
      color="danger"
      title="Sources With No Data"
      subtitle="These files where chosen to be extracted by a transformer, but no data was extracted."
      icon={<ImageNotSupportedRoundedIcon />}>
      <Table size='md' color="neutral" variant="outlined" sx={{ mt: 2, borderRadius: "sm", tableLayout: "auto" }} borderAxis="bothBetween">
        <thead>
          <tr>
            <th>Source File</th>
            <th>Group</th>
            <th>Transformer</th>
          </tr>
        </thead>
        <tbody>
          {empty_source.map((i, index) => <tr key={index}>
            <td><code>{i.source}</code></td>
            <td>{i.group}</td>
            <td><Chip variant="soft" color="primary">{i.transformer}</Chip></td>
          </tr>)}
        </tbody>
      </Table>
    </AnalysisAccordion>
  );
}

/** ------------------------------------------------------------------------- */

export default React.memo(EmptySourceCard);
