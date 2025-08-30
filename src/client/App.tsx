import React from 'react';
import ViewPane from './view/ViewPane';
import Stack from '@mui/joy/Stack';
import AlertPopup from './modals/AlertPopup';
import NewQuarterModal from './modals/NewQuarterModal';

/** ------------------------------------------------------------------------- */

function App() {
  React.useEffect(() => {
    document.title = "Rebater — Fuse Alliance Rebate Processor";
  });

  return (
    <Stack component="article" flex={1} justifyContent="stretch" alignItems="stretch">
      <ViewPane/>
      <AlertPopup />
      <NewQuarterModal />
    </Stack>
  );
}

/** ------------------------------------------------------------------------- */

export default React.memo(App);
