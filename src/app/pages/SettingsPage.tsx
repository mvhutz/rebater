import React from 'react';
import { SettingsData } from '../../shared/settings';
import SettingsContext from '../context/SettingsContext';

/** ------------------------------------------------------------------------- */

interface StrategyProps {
  onStrategy?: (strategy?: SettingsData["strategy"]) => void;
  strategy?: SettingsData["strategy"];
}

/** ------------------------------------------------------------------------- */

function NoneStrategyForm(props: StrategyProps) {
  void [props];

  return (
    <fieldset>
      <i>Select a setting type from above...</i>
    </fieldset>
  );
}

/** ------------------------------------------------------------------------- */

function BasicStrategyForm(props: StrategyProps) {
  const { invoke } = window.api;
  const { onStrategy, strategy } = props;

  const [directory, setDirectory] = React.useState<string | null>(null);
  console.log(strategy);
  React.useEffect(() => {
    if (strategy != null && strategy.type === "basic") {
      setDirectory(strategy.directory);
    }
  }, [strategy]);

  React.useEffect(() => {
    if (directory != null) {
      onStrategy?.({ type: "basic", directory });
    }
  }, [directory, onStrategy]);

  const handleDirectory = React.useCallback(async () => {
    const [directory] = await invoke.chooseDir();
    if (directory == null) {
      alert("No directory chosen!");
      return;
    }

    setDirectory(directory);
  }, [invoke]);

  return (
    <fieldset>
      <button onClick={handleDirectory}>Choose Directory.</button>
      { directory != null &&
        <p>Currently, <q><b>{directory}</b></q> is chosen.</p>
      }
    </fieldset>
  );
}

/** ------------------------------------------------------------------------- */

function StrategyForm(props: StrategyProps) {
  const { strategy, onStrategy } = props;
  const [type, setType] = React.useState<string>("none");

  React.useEffect(() => {
    if (strategy != null) {
      setType(strategy.type);
    }
  }, [strategy]);

  return (
    <section>
      <h3>Strategy</h3>
      <select value={type} onChange={e => setType(e.target.value)}>
        <option value="none">None</option>
        <option value="basic">Basic</option>
      </select>
      { type === "none" && <NoneStrategyForm onStrategy={onStrategy} strategy={strategy} /> }
      { type === "basic" && <BasicStrategyForm onStrategy={onStrategy} strategy={strategy}/>}
    </section>
  )
}

/** ------------------------------------------------------------------------- */

function SettingsPage() {
  const { settings, setSettings, pullSettings, pushSettings } = React.useContext(SettingsContext);
  const [strategy, setStrategy] = React.useState<SettingsData["strategy"] | undefined>();

  React.useEffect(() => {
    if (strategy == null) return;
    setSettings(s => ({ ...s, strategy }));
  }, [strategy, setSettings]);

  React.useEffect(() => {
    setStrategy(settings?.strategy);
  }, [settings?.strategy]);

  return (
    <fieldset>
      <h2>Settings</h2>
      <StrategyForm strategy={strategy} onStrategy={setStrategy} />
      <h3>Options</h3>
      <button onClick={pushSettings}>Save</button>
      <button onClick={pullSettings}>Refresh</button>
    </fieldset>
  );
}

/** ------------------------------------------------------------------------- */

export default React.memo(SettingsPage);