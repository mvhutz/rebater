import React from 'react';
import { SettingsData } from '../../shared/settings';
import SettingsContext from './SettingsContext';

/** ------------------------------------------------------------------------- */

interface SettingsProviderProps {
  children?: React.ReactNode
}

function SettingsProvider(props: SettingsProviderProps) {
  const { children } = props;
  const { invoke } = window.api;
  const [settings, setSettings] = React.useState<SettingsData | undefined>(undefined);

  const pushSettings = React.useCallback(async () => {
    if (settings == null) {
      alert("No settings selected!");
      return;
    }

    const { good, message } = await invoke.setSettings(settings);
    if (good) {
      alert("Saved!");
    } else {
      alert(`ERROR: '${message}'`);
    }
  }, [invoke, settings]);

  const pullSettings = React.useCallback(async () => {
    const settings = await invoke.getSettings();
    setSettings(settings);
  }, [invoke]);

  React.useEffect(() => {
    pullSettings();
  }, [pullSettings]);

  return (
    <SettingsContext.Provider value={{ settings, setSettings, pushSettings, pullSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

/** ------------------------------------------------------------------------- */

export default React.memo(SettingsProvider);
