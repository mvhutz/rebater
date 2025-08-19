import React from 'react';
import ViewPane from './view/ViewPane';
import Stack from '@mui/joy/Stack';
import Divider from '@mui/joy/Divider';
import AlertPopup from './modals/AlertPopup';
import SettingsPane from './sidebar/SettingsPane';

/** ------------------------------------------------------------------------- */

function App() {
  React.useEffect(() => {
    document.title = "Rebater — Fuse Alliance Rebate Processor";
  });

  return (
    <Stack component="article" direction="row">
      <ViewPane/>
      <Divider />
      <SettingsPane />
      <AlertPopup />
    </Stack>
  );
}

/** ------------------------------------------------------------------------- */

export default React.memo(App);
