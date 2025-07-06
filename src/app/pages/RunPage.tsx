import React from 'react';
import SettingsContext from '../context/SettingsContext';

/** ------------------------------------------------------------------------- */

function RunPage() {
  const { invoke, handle, remove } = window.api;
  const [running, setRunning] = React.useState(false);
  const { settings } = React.useContext(SettingsContext);
  const [progress, setProgress] = React.useState(0);
  const [results, setResults] = React.useState<RunResults | null>(null);

  React.useEffect(() => {
    handle.runnerUpdate(async (_, { data }) => {
      console.log("STATUS!", data);
      switch (data.type) {
        case "idle":
          setResults(null);
          setRunning(false);
          setProgress(0);
          break;
        case "error":
          setResults(null);
          setRunning(false);
          setProgress(0);
          alert(`Error during processing: ${data.message}`);
          break;
        case "running":
          setResults(null);
          setProgress(Math.round(100 * data.progress));
          break;
        case "done":
          setRunning(false);
          setProgress(0);
          setResults(data.results);
          break;
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
      { results && <>
        <table>
          <thead>
            <tr>
              <th>Supplier</th>
              <th>Time (ms)</th>
            </tr>
          </thead>
          <tbody>
            { results.config.map(r => <tr key={r.name}>
              <td>{r.name}</td>
              <td>{Math.round(r.end - r.start)}</td>
            </tr>) }
          </tbody>
        </table>
        <table>
          <thead>
            <tr>
              <th>Supplier ID</th>
              <th>Drop</th>
              <th>Take</th>
            </tr>
          </thead>
          <tbody>
            { results.discrepency.map(r => <tr key={r.name}>
              <td>{r.name}</td>
              <td>
                <code style={{ whiteSpace: "pre", color: "red" }}>
                  {r.drop.join("\n")}
                </code>
              </td>
              <td>
                <code style={{ whiteSpace: "pre" , color: "green"}}>
                  {r.take.join("\n")}
                </code>
              </td>
            </tr>) }
          </tbody>
        </table>
      </> }
    </div>
  );
}

/** ------------------------------------------------------------------------- */

export default React.memo(RunPage);
