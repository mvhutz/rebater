import React from 'react';
import { SettingsData } from '../../shared/settings';

/** ------------------------------------------------------------------------- */

interface SettingsContextProps {
  settings?: SettingsData;
  setSettings: React.Dispatch<React.SetStateAction<SettingsData | undefined>>;
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