import React from 'react';
import * as Settings from '../shared/settings/Settings';
import * as SettingsStrategy from '../shared/settings/strategy';

/** ------------------------------------------------------------------------- */

interface StrategyProps {
  onStrategy?: (strategy?: SettingsStrategy.Data) => void;
  strategy?: SettingsStrategy.Data;
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

interface SettingsPageProps {
  settings?: Settings.Data;
  onSettings?: (settings?: Settings.Data) => void;
}

function SettingsPage(props: SettingsPageProps) {
  const { invoke } = window.api;
  const { settings, onSettings } = props;

  const [strategy, setStrategy] = React.useState<SettingsStrategy.Data | undefined>();

  React.useEffect(() => {
    if (strategy != null) {
      onSettings?.({ strategy });
    }
  }, [onSettings, strategy]);

  React.useEffect(() => {
    setStrategy(settings?.strategy);
  }, [settings?.strategy]);

  const handleSave = React.useCallback(async () => {
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

  const handleRefresh = React.useCallback(async () => {
    const settings = await invoke.getSettings();
    onSettings?.(settings);
  }, [invoke, onSettings]);

  React.useEffect(() => {
    handleRefresh();
  }, [handleRefresh]);

  return (
    <fieldset>
      <h2>Settings</h2>
      <StrategyForm strategy={strategy} onStrategy={setStrategy} />
      <h3>Options</h3>
      <button onClick={handleSave}>Save</button>
      <button onClick={handleRefresh}>Refresh</button>
    </fieldset>
  );
}

/** ------------------------------------------------------------------------- */

export default React.memo(SettingsPage);