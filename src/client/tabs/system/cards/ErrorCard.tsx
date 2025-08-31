import Stack from '@mui/joy/Stack';
import Typography from '@mui/joy/Typography';
import React from 'react';
import { useAppSelector } from '../../../store/hooks';
import { getRunError } from '../../../store/slices/system';
import AnalysisAccordion from '../AnalysisAccordion';
import ReportRoundedIcon from '@mui/icons-material/ReportRounded';

/** ------------------------------------------------------------------------- */

function ErrorCard() {
  const message = useAppSelector(getRunError);
  if (message == null) return;

  return (
    <AnalysisAccordion color="danger" title="Error" subtitle="See inside for more details." icon={<ReportRoundedIcon />}>
      <Stack overflow="scroll" pt={1}>
        <Typography component="code" sx={{ fontFamily: 'monospace', whiteSpace: "pre" }}>{message}</Typography>
      </Stack>
    </AnalysisAccordion>
  );
}

/** ------------------------------------------------------------------------- */

export default React.memo(ErrorCard);
