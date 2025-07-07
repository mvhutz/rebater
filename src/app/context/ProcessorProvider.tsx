import React from 'react';
import { SettingsData } from '../../shared/settings';
import { RunnerStatus } from 'src/system/Runner';
import ProcessorContext from './ProcessorContext';

/** ------------------------------------------------------------------------- */

interface SettingsProviderProps {
  children?: React.ReactNode
}

function SettingsProvider(props: SettingsProviderProps) {
  const { children } = props;
  const { invoke, handle, remove } = window.api;
  const [status, setStatus] = React.useState<RunnerStatus>({ type: "idle" });

  React.useEffect(() => {
    handle.runnerUpdate(async (_, { data }) => {
      console.log("STATUS!", data);
      setStatus(data);
    });

    return () => remove.runnerUpdate();
  }, [remove, handle]);

  const run = React.useCallback(async (settings: SettingsData) => {
    if (status.type === "loading" || status.type === "running") return false;
    await invoke.runProgram(settings);
  }, [invoke, status]);

  return (
    <ProcessorContext.Provider value={{ status, run }}>
      {children}
    </ProcessorContext.Provider>
  );
}

/** ------------------------------------------------------------------------- */

export default React.memo(SettingsProvider);
