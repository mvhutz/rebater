import React from 'react';
import SettingsContext from '../context/SettingsContext';

/** ------------------------------------------------------------------------- */

function RunPage() {
  const { invoke, handle, remove } = window.api;
  const [running, setRunning] = React.useState(false);
  const { settings } = React.useContext(SettingsContext);
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    handle.runnerUpdate(async (_, { data }) => {
      switch (data.type) {
        case "idle":
          setRunning(false);
          setProgress(0);
          break;
        case "running":
          setProgress(Math.round(100 * data.progress))
      }
    });

    return () => remove.runnerUpdate();
  }, []);

  const handleRun = React.useCallback(async () => {
    if (running) return;

    if (settings == null) {
      alert("Invalid settings!");
      return;
    }

    await invoke.runProgram(settings);
    setProgress(0);
    setRunning(true);
    console.log("Started!");
  }, []);

  const button_text = running ? "Running..." : "Start Rebator!"

  return (
    <div>
      <button disabled={running} onClick={handleRun}>{button_text}</button>
      { running && <progress value={progress} max="100"/> }
    </div>
  );
}

/** ------------------------------------------------------------------------- */

export default React.memo(RunPage);
