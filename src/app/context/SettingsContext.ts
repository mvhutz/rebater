import React from 'react';
import * as Settings from '../../shared/settings';

/** ------------------------------------------------------------------------- */

interface SettingsContextProps {
  settings?: Settings.Data;
  setSettings: React.Dispatch<React.SetStateAction<Settings.Data | undefined>>;
  pullSettings: () => void;
  pushSettings: () => void;
}

const DEFAULT = {
  settings: undefined,
  setSettings: () => null,
  pullSettings: () => null,
  pushSettings: () => null,
}

const SettingsContext = React.createContext<SettingsContextProps>(DEFAULT);

/** ------------------------------------------------------------------------- */

export default SettingsContext;