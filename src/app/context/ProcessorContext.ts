import React from 'react';
import { SettingsData } from '../../shared/settings';
import { RunnerStatus } from '../../system/Runner';

/** ------------------------------------------------------------------------- */

interface ProcessorContextProps {
  status: RunnerStatus;
  run: (settings_data: SettingsData) => void;
}

const DEFAULT: ProcessorContextProps = {
  status: { type: "idle" },
  run: () => null
}

const ProcessorContext = React.createContext<ProcessorContextProps>(DEFAULT);

/** ------------------------------------------------------------------------- */

export default ProcessorContext;