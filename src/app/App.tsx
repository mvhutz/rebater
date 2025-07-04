import React from 'react';
import SettingsPage from './pages/SettingsPage';
import { Route, Routes } from 'react-router';
import Navigation from './Navigation';
import HomePage from './pages/HomePage';
import RunPage from './pages/RunPage';

/** ------------------------------------------------------------------------- */

function App() {
  React.useEffect(() => {
    document.title = "Rebater — Fuse Alliance Rebate Processor";
  });

  return <>
    <Navigation/>
    <main>
      <Routes>
        <Route path="/settings" element={<SettingsPage/>}/>
        <Route path="/run" element={<RunPage/>}/>
        <Route path="/" element={<HomePage/>}/>
      </Routes>
    </main>
  </>;
}

/** ------------------------------------------------------------------------- */

export default React.memo(App);
