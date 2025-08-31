import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import Stack from '@mui/joy/Stack';
import Input from '@mui/joy/Input';
import IconButton from '@mui/joy/IconButton';
import FolderSpecialRounded from '@mui/icons-material/FolderSpecialRounded';
import FormHelperText from '@mui/joy/FormHelperText';
import React from 'react';
import Switch from '@mui/joy/Switch';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { getDraftSettings, getDraftTesting, setDraftSystemDirectory, setDraftSystemTestAll, setDraftSystemTesting } from '../../store/slices/system';
import { Tooltip } from '@mui/joy';

/** ------------------------------------------------------------------------- */

function BasicTargetSettings() {
  const { invoke } = window.api;
  const { directory } = useAppSelector(getDraftSettings);
  const dispatch = useAppDispatch();

  const handleDirectory = React.useCallback(async () => {
    const [new_directory] = await invoke.chooseDir();
    if (new_directory == null) {
      alert("No directory chosen!");
      return;
    }

    dispatch(setDraftSystemDirectory(new_directory));
  }, [dispatch, invoke]);

  return (
    <FormControl>
      <FormLabel>Data Directory</FormLabel>
      <Stack direction="row" spacing={1}>
          <Input variant="outlined" sx={{ pr: 0.5 }}  value={directory ?? "No folder selected..."} fullWidth endDecorator={<Stack spacing={0.5} direction="row">
            <Tooltip title="Select New Directory">
              <IconButton onClick={handleDirectory}><FolderSpecialRounded fontSize="small" /></IconButton>
            </Tooltip>
          </Stack>} />
      </Stack>
      <FormHelperText>Data will be taken from this directory.</FormHelperText>
    </FormControl>
  );
}

/** ------------------------------------------------------------------------- */

function AdvancedSettings() {
  const { compare_all, enabled } = useAppSelector(getDraftTesting);
  const dispatch = useAppDispatch();

  const handleTesting = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setDraftSystemTesting(event.target.checked));
  }, [dispatch]);

  const handleTestAll = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setDraftSystemTestAll(event.target.checked));
  }, [dispatch]);

  return (
    <Stack spacing={4} pt={1}>
      <BasicTargetSettings />
      <FormControl>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <FormLabel>Run Discrepancy Report</FormLabel>
          <Switch checked={enabled} onChange={handleTesting} />
        </Stack>
        <FormHelperText>If selected, the system will scrutinize its output against all rebate files in the "truth" folder and note any differences.</FormHelperText>
      </FormControl>
      <FormControl>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <FormLabel>Compare All Suppliers</FormLabel>
          <Switch disabled={!enabled} checked={compare_all} onChange={handleTestAll} />
        </Stack>
        <FormHelperText>If selected, discrepancies will be checked in all suppliers, not only those produced by the transformers.</FormHelperText>
      </FormControl>
    </Stack>
  );
}

/** ------------------------------------------------------------------------- */

export default React.memo(AdvancedSettings);
