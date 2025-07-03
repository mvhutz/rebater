import React from 'react';
import SettingsPage from './SettingsPage';
import * as Settings from '../shared/settings/Settings';

/** ------------------------------------------------------------------------- */

function App() {
  const [settings, setSettings] = React.useState<Settings.Data | undefined>(undefined);

  React.useEffect(() => {
    document.title = "Rebater — Fuse Alliance Rebate Processor";
  });

  return (
    <div>
      <h1>Rebater</h1>
      <SettingsPage settings={settings} onSettings={setSettings}/>
    </div>
  );
}

/** ------------------------------------------------------------------------- */

export default React.memo(App);
