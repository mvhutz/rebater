import React from 'react';
import SettingsContext from '../context/SettingsContext';

/** ------------------------------------------------------------------------- */

function RunPage() {
  const { invoke } = window.api;
  const [running, setRunning] = React.useState(false);
  const { settings } = React.useContext(SettingsContext);

  const handleRun = React.useCallback(async () => {
    if (running) return;
    setRunning(true);

    if (settings == null) {
      alert("Invalid settings!");
    } else {
      const response = await invoke.runProgram(settings);
      console.log("DONE!");
    }

    setRunning(false);
  }, []);

  const button_text = running ? "Running..." : "Start Rebator!"

  return (
    <div>
      <button disabled={running} onClick={handleRun}>{button_text}</button>
    </div>
  );
}

/** ------------------------------------------------------------------------- */

export default React.memo(RunPage);
