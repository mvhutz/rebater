import React from 'react';
import { SettingsData } from '../../../shared/settings';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { getSystemSettings, isSystemActive, pullSystemSettings, pushSystemSettings, startSystem } from '../../store/slices/system';
import { Accordion, AccordionDetails, AccordionGroup, AccordionSummary, Button, Chip, FormControl, FormHelperText, FormLabel, ListDivider, ListItemContent, Sheet, Stack, ToggleButtonGroup, Typography } from '@mui/joy';
import { SxProps } from '@mui/joy/styles/types';
import SettingsRounded from '@mui/icons-material/SettingsRounded';
import PlayArrowRounded from '@mui/icons-material/PlayArrowRounded';
import FolderSpecialIcon from '@mui/icons-material/FolderSpecial';

/** ------------------------------------------------------------------------- */

interface StrategyProps {
  onStrategy?: (strategy?: SettingsData["strategy"]) => void;
  strategy?: SettingsData["strategy"];
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

  const handleOpenDirectory = React.useCallback(async () => {
    if (directory == null) return;

    await invoke.openDir(directory);
  }, [directory]);

  const folder = directory?.split("/")?.at(-1);

  return (
    <FormControl>
      <FormLabel>Data Directory</FormLabel>
      <Button onClick={handleDirectory} startDecorator={<FolderSpecialIcon/>}>Select Folder</Button>
      {directory != null &&
        <FormHelperText>
          Currently, <Chip variant="outlined" color="primary" onClick={handleOpenDirectory}>{folder ?? ""}</Chip> is chosen.
        </FormHelperText>
      }
    </FormControl>
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

  return <>
    <FormControl>
      <FormLabel>Strategy</FormLabel>
      <ToggleButtonGroup size='sm' value={type} onChange={(_, v) => setType(v ?? "none")}>
        <Button value="none">None</Button>
        <Button value="basic">Basic</Button>
      </ToggleButtonGroup>
      {type === "none" && <FormHelperText>No strategy is set. You must choose one from above.</FormHelperText>}
      {type === "basic" && <FormHelperText>All data will be taken from one directory.</FormHelperText>}
    </FormControl>

    {type === "basic" && <BasicStrategyForm onStrategy={onStrategy} strategy={strategy} />}
  </>;
}

/** ------------------------------------------------------------------------- */

const SETTINGS_SX: SxProps = {
  borderRight: 0,
  borderTop: 0,
  borderBottom: 0,
  gap: 1,
  width: 300,
  height: "100vh",
  boxSizing: "border-box"
}

function GeneralSettings() {
  const trueSettings = useAppSelector(getSystemSettings);
  const dispatch = useAppDispatch();
  const [newSettings, setNewSettings] = React.useState<Maybe<SettingsData>>();
  const [strategy, setStrategy] = React.useState<Maybe<SettingsData["strategy"]>>();

  React.useEffect(() => {
    setNewSettings(trueSettings.data);
  }, [trueSettings.data]);

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
    <Accordion>
      <AccordionSummary variant="soft">
        <SettingsRounded />
        <ListItemContent>
          <Typography level="title-lg">General</Typography>
        </ListItemContent>
      </AccordionSummary>
      <AccordionDetails>
        <Stack spacing={2} pt={1}>
        <StrategyForm strategy={newSettings?.strategy} onStrategy={setStrategy}/>
        {/* <FormControl>
          <Stack direction="row" spacing={1}>
            <IconButton onClick={refreshSettings} variant="outlined"><RestoreIcon/></IconButton>
            <Button onClick={saveSettings} variant="soft" color="neutral" fullWidth>Save</Button>
          </Stack>
        </FormControl> */}
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
}

/** ------------------------------------------------------------------------- */


function SettingsPane() {
  const dispatch = useAppDispatch();
  const active = useAppSelector(isSystemActive);

  const handleRun = React.useCallback(() => {
    dispatch(startSystem());
  }, [dispatch]);

  return (
    <Sheet sx={SETTINGS_SX} variant="outlined" color="neutral">
      <Stack direction="column" overflow="scroll" height="100vh">
        <AccordionGroup variant="plain" transition="0.2s" size='lg'>
          <GeneralSettings />
        </AccordionGroup>
        <ListDivider/>
        <Button onClick={handleRun} startDecorator={<PlayArrowRounded/>} sx={{ borderRadius: 0 }} variant="solid" size='lg' loading={active} loadingIndicator="Running...">Start</Button>
      </Stack>
    </Sheet >
  );
}

/** ------------------------------------------------------------------------- */

export default React.memo(SettingsPane);