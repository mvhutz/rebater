import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import Stack from '@mui/joy/Stack';
import Input from '@mui/joy/Input';
import IconButton from '@mui/joy/IconButton';
import FolderSpecialRounded from '@mui/icons-material/FolderSpecialRounded';
import FormHelperText from '@mui/joy/FormHelperText';
import SettingsRounded from '@mui/icons-material/SettingsRounded';
import Accordion from '@mui/joy/Accordion';
import AccordionSummary from '@mui/joy/AccordionSummary';
import ListItemContent from '@mui/joy/ListItemContent';
import Typography from '@mui/joy/Typography';
import AccordionDetails from '@mui/joy/AccordionDetails';
import React from 'react';
import { useAppDispatch, useAppSelector } from '../../../client/store/hooks';
import { getSystemSettings, getTestAll, getTestSettings, setSystemTarget, setSystemTestAll, setSystemTesting } from '../../../client/store/slices/system';
import Switch from '@mui/joy/Switch';

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
        <Input variant="outlined" sx={{ pr: 0.5 }}  value={directory ?? "No folder selected..."} fullWidth endDecorator={<Stack spacing={0.5} direction="row">
          <IconButton onClick={handleDirectory}><FolderSpecialRounded fontSize="small" /></IconButton>
        </Stack>} />
      </Stack>
      <FormHelperText>Data will be taken from this directory.</FormHelperText>
    </FormControl>
  );
}

/** ------------------------------------------------------------------------- */

function TargetSettings() {
  const { data: { advanced: { target } } } = useAppSelector(getSystemSettings);
  const { type } = target;

  return <Stack spacing={2}>
    {type === "basic" && <BasicTargetSettings />}
  </Stack>;
}

/** ------------------------------------------------------------------------- */

function AdvancedSettings() {
  const doTesting = useAppSelector(getTestSettings);
  const doCompareAll = useAppSelector(getTestAll);
  const dispatch = useAppDispatch();

  const handleTesting = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setSystemTesting(event.target.checked));
  }, [dispatch]);

  const handleTestAll = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setSystemTestAll(event.target.checked));
  }, [dispatch]);

  return (
    <Accordion>
      <AccordionSummary variant="soft">
        <SettingsRounded />
        <ListItemContent>
          <Typography level="title-lg">Advanced</Typography>
        </ListItemContent>
      </AccordionSummary>
      <AccordionDetails>
        <Stack spacing={4} pt={1}>
          <TargetSettings />
          <Stack spacing={2}>
            <FormControl>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <FormLabel>Run Discrepancy Report</FormLabel>
                <Switch checked={doTesting ?? false} onChange={handleTesting} />
              </Stack>
              <FormHelperText>If selected, the system will scrutinize its output against all rebate files in the "truth" folder and note any differences.</FormHelperText>
            </FormControl>
            <FormControl>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <FormLabel>Compare All Suppliers</FormLabel>
                <Switch disabled={!doTesting} checked={doCompareAll} onChange={handleTestAll} />
              </Stack>
              <FormHelperText>If selected, discrepancies will be checked in all suppliers, not only those produced by the transformers.</FormHelperText>
            </FormControl>
          </Stack>
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
}

/** ------------------------------------------------------------------------- */

export default React.memo(AdvancedSettings);
