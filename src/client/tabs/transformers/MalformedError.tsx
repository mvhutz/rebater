import React from 'react';
import Stack from '@mui/joy/Stack';
import Typography from '@mui/joy/Typography';
import { Alert } from '@mui/joy';
import ErrorIcon from '@mui/icons-material/Error';

/** ------------------------------------------------------------------------- */

interface MalformedErrorProps {
  error: string
}

function MalformedError(props: MalformedErrorProps) {
  const { error } = props;

  return (
    <Stack sx={{ position: "sticky", bottom: 10 }} width={1} px={1} boxSizing="border-box">
      <Alert startDecorator={<ErrorIcon sx={{ fontSize: 25 }} />} sx={{ alignItems: 'flex-start', overflow: "scroll" }} color='danger' invertedColors variant="solid">
        <div>
          <div>Error</div>
          <Typography color="primary" level="body-sm" fontWeight="400" component="code" sx={{ fontFamily: 'monospace', overflowWrap: "break-word" }}>
            {error}
          </Typography>
        </div>
      </Alert>
    </Stack>
  );
}

/** ------------------------------------------------------------------------- */

export default React.memo(MalformedError);
