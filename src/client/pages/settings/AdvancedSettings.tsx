import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import Stack from '@mui/joy/Stack';
import Input from '@mui/joy/Input';
import IconButton from '@mui/joy/IconButton';
import FolderSpecialRounded from '@mui/icons-material/FolderSpecialRounded';
import ToggleButtonGroup from '@mui/joy/ToggleButtonGroup';
import Button from '@mui/joy/Button';
import FormHelperText from '@mui/joy/FormHelperText';
import SettingsRounded from '@mui/icons-material/SettingsRounded';
import Accordion from '@mui/joy/Accordion';
import AccordionSummary from '@mui/joy/AccordionSummary';
import ListItemContent from '@mui/joy/ListItemContent';
import Typography from '@mui/joy/Typography';
import AccordionDetails from '@mui/joy/AccordionDetails';
import React from 'react';
import { useAppDispatch, useAppSelector } from '../../../client/store/hooks';
import { getSystemSettings, setSystemTarget } from '../../../client/store/slices/system';

/** ------------------------------------------------------------------------- */

function BasicTargetSettings() {
  const { invoke } = window.api;
  const { data: { advanced: { target } } } = useAppSelector(getSystemSettings);
  const dispatch = useAppDispatch();

  const directory = target.type === "basic" ? target.directory : null;

  const handleDirectory = React.useCallback(async () => {
    const [new_directory] = await invoke.chooseDir();
    if (new_directory == null) {
      alert("No directory chosen!");
      return;
    }

    dispatch(setSystemTarget({ type: "basic", directory: new_directory }));
  }, [dispatch, invoke]);

  return (
    <FormControl>
      <FormLabel>Data Directory</FormLabel>
      <Stack direction="row" spacing={1}>
        <Input value={directory ?? "No folder selected..."} fullWidth />
        <IconButton onClick={handleDirectory} variant="soft" color="primary"><FolderSpecialRounded/></IconButton>
      </Stack>
    </FormControl>
  );
}

/** ------------------------------------------------------------------------- */

function TargetSettings() {
  const { data: { advanced: { target } } } = useAppSelector(getSystemSettings);
  const dispatch = useAppDispatch();
  const { type } = target;

  const handleType = React.useCallback((_: unknown, value: Maybe<typeof target["type"]>) => {
    switch (value) {
      case "basic":
        dispatch(setSystemTarget({ type: "basic" }));
        break;
    }
  }, [dispatch]);

  return <>
    <FormControl>
      <FormLabel>Strategy</FormLabel>
      <ToggleButtonGroup size='sm' value={type} onChange={handleType}>
        <Button value="basic">Basic</Button>
      </ToggleButtonGroup>
      {type === "basic" && <FormHelperText>All data will be taken from one directory.</FormHelperText>}
    </FormControl>

    {type === "basic" && <BasicTargetSettings />}
  </>;
}

/** ------------------------------------------------------------------------- */

function AdvancedSettings() {
  return (
    <Accordion>
      <AccordionSummary variant="soft">
        <SettingsRounded />
        <ListItemContent>
          <Typography level="title-lg">Advanced</Typography>
        </ListItemContent>
      </AccordionSummary>
      <AccordionDetails>
        <Stack spacing={2} pt={1}>
          <TargetSettings />
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
}

/** ------------------------------------------------------------------------- */

export default React.memo(AdvancedSettings);
