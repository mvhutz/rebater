import React from 'react';
import SettingsPage from './pages/SettingsPage';
import { Route, Routes } from 'react-router';
import Navigation from './navigation/Navigation';
import HomePage from './pages/HomePage';
import RunPage from './pages/run/RunPage';
import Sheet from '@mui/joy/Sheet';

/** ------------------------------------------------------------------------- */

function App() {
  React.useEffect(() => {
    document.title = "Rebater — Fuse Alliance Rebate Processor";
  });

  return (
    <Sheet component="article">
      <Navigation/>
      <Routes>
        <Route path="/settings" element={<SettingsPage/>}/>
        <Route path="/processor" element={<RunPage/>}/>
        <Route path="/" element={<HomePage/>}/>
      </Routes>
    </Sheet>
  );
}

/** ------------------------------------------------------------------------- */

export default React.memo(App);
