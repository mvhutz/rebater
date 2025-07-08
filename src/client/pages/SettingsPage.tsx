import React from 'react';
import { SettingsData } from '../../shared/settings';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { getSystemSettings, pullSystemSettings, pushSystemSettings } from '../store/slices/system';

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
  const trueSettings = useAppSelector(getSystemSettings);
  const dispatch = useAppDispatch();
  const [newSettings, setNewSettings] = React.useState<Maybe<SettingsData>>();
  const [strategy, setStrategy] = React.useState<Maybe<SettingsData["strategy"]>>();

  React.useEffect(() => {
    setNewSettings(trueSettings.data);
  }, [trueSettings]);

  React.useEffect(() => {
    if (strategy == null) return;
    setNewSettings(s => ({ ...s, strategy }));
  }, [strategy]);

  React.useEffect(() => {
    setStrategy(newSettings?.strategy);
  }, [newSettings?.strategy]);

  const refreshSettings = React.useCallback(() => {
    dispatch(pullSystemSettings());
  }, []);

  const saveSettings = React.useCallback(() => {
    dispatch(pushSystemSettings(newSettings));
  }, [newSettings]);

  return (
    <fieldset>
      <h2>Settings</h2>
      <StrategyForm strategy={strategy} onStrategy={setStrategy} />
      <h3>Options</h3>
      <button onClick={saveSettings}>Save</button>
      <button onClick={refreshSettings}>Refresh</button>
    </fieldset>
  );
}

/** ------------------------------------------------------------------------- */

export default React.memo(SettingsPage);