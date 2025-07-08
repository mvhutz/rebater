import React from 'react';
import SettingsPane from './pages/settings/SettingsPane';
import RunPane from './pages/run/RunPane';
import Stack from '@mui/joy/Stack';
import Divider from '@mui/joy/Divider';

/** ------------------------------------------------------------------------- */

function App() {
  React.useEffect(() => {
    document.title = "Rebater — Fuse Alliance Rebate Processor";
  });

  return (
    <Stack component="article" direction="row">
      <RunPane/>
      <Divider />
      <SettingsPane />
    </Stack>
  );
}

/** ------------------------------------------------------------------------- */

export default React.memo(App);
