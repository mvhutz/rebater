import React from 'react';
import { useAppSelector } from '../../../store/hooks';
import { getRunResults } from '../../../store/slices/system';
import AnalysisAccordion from '../AnalysisAccordion';
import GridOffRoundedIcon from '@mui/icons-material/GridOffRounded';
import { Chip, Table } from '@mui/joy';

/** ------------------------------------------------------------------------- */

function EmptyTableCard() {
  const results = useAppSelector(getRunResults);
  if (results == null) return;

  const { issues: { empty_sheet } } = results
  return (
    <AnalysisAccordion
      disabled={empty_sheet.length === 0}
      amount={empty_sheet.length}
      color="danger"
      title="Blank Source Sheets"
      subtitle="These sheets were successfully pulled from source files and preprocessed, but no data was extracted. If the sheet should contain data, make sure any preprocessing done to the tables is correct."
      icon={<GridOffRoundedIcon />}>
      <Table size='md' color="neutral" variant="outlined" sx={{ mt: 2, borderRadius: "sm", tableLayout: "auto" }} borderAxis="bothBetween">
        <thead>
          <tr>
            <th>Sheet</th>
            <th>Source File</th>
            <th>Group</th>
            <th>Transformer</th>
          </tr>
        </thead>
        <tbody>
          {empty_sheet.map((i, index) => <tr key={index}>
            <td><q>{i.sheet}</q></td>
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

export default React.memo(EmptyTableCard);
