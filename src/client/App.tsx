import React from 'react';
import SettingsPane from './pages/settings/SettingsPane';
import ViewPane from './pages/view/ViewPane';
import Stack from '@mui/joy/Stack';
import Divider from '@mui/joy/Divider';
import AlertPopup from './AlertPopup';
import InputModal from './InputModal';

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
      <InputModal />
    </Stack>
  );
}

/** ------------------------------------------------------------------------- */

export default React.memo(App);
