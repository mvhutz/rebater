import FlashOffIcon from '@mui/icons-material/FlashOffRounded';
import React from 'react';
import { Alert, Stack, Typography } from "@mui/joy";

/** ------------------------------------------------------------------------- */

function EmptyEditor() {
  return (
    <Stack flex={1} position="relative">
        <Stack sx={{ position: "absolute", bottom: 1 }} padding={2} width={1} boxSizing="border-box">
          <Alert startDecorator={<FlashOffIcon sx={{ fontSize: 25 }} color="action" />} variant="soft" sx={{ alignItems: 'flex-start' }}>
            <div>
              <div>No transformer selected!</div>
              <Typography level="body-sm" fontWeight="400" color="neutral">
                Use the picker above to edit a specific configuration.
              </Typography>
            </div>
          </Alert>
        </Stack>
      </Stack>
  )
}

/** ------------------------------------------------------------------------- */

export default React.memo(EmptyEditor);