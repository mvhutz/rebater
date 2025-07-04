import React from 'react';
import SettingsPage from './pages/SettingsPage';
import { HashRouter, Route, Routes } from 'react-router';
import SettingsProvider from './context/SettingsProvider';

/** ------------------------------------------------------------------------- */

function App() {
  React.useEffect(() => {
    document.title = "Rebater — Fuse Alliance Rebate Processor";
  });

  return (
    <SettingsProvider>
      <HashRouter>
        <Routes>
          <Route index path="/" element={<SettingsPage/>}/>
        </Routes>
      </HashRouter>
    </SettingsProvider>
  );
}

/** ------------------------------------------------------------------------- */

export default React.memo(App);
