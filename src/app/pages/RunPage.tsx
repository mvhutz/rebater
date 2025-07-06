import React from 'react';
import SettingsContext from '../context/SettingsContext';
import ProcessorContext from '../context/ProcessorContext';

/** ------------------------------------------------------------------------- */

function RunPage() {
  const { settings } = React.useContext(SettingsContext);
  const { status, run } = React.useContext(ProcessorContext);

  const handleRun = React.useCallback(async () => {
    if (settings == null) {
      alert("Invalid settings!");
      return;
    }

    run(settings);
    console.log("Started!");
  }, [settings, run]);

  const running = status.type === "running";
  const button_text = running ? "Running..." : "Start Rebator!";
  const progress = status.type === "running" ? status.progress : 0;
  const results = status.type === "done" ? status.results : null;

  return (
    <div>
      <button disabled={running} onClick={handleRun}>{button_text}</button>
      { running && <progress value={100 * progress} max="100"/> }
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
      { status.type === "error" && <section>
        <h2>ERROR!</h2>
        <code>
          {status.message}
        </code>
      </section> }
    </div>
  );
}

/** ------------------------------------------------------------------------- */

export default React.memo(RunPage);
