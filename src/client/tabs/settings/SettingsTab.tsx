import React from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import Button from '@mui/joy/Button';
import Stack from '@mui/joy/Stack';
import AdvancedSettings from './AdvancedSettings';
import { SaveRounded } from '@mui/icons-material';
import { pullAllQuarters, pullQuestions, pullSystemSettings, pullTransformers, pushSystemSettings } from '../../store/slices/thunk';
import { getDisplayTab, getVisible } from '../../store/slices/ui';
import { IconButton, Typography } from '@mui/joy';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import TabMenu from '../../view/TabMenu';

/** ------------------------------------------------------------------------- */

function SettingsTab() {
  const display = useAppSelector(getDisplayTab("settings"));
  const dispatch = useAppDispatch();
  const { settings: show } = useAppSelector(getVisible);

  const handleSave = React.useCallback(async () => {
    await dispatch(pushSystemSettings());
    await dispatch(pullSystemSettings());
    await dispatch(pullTransformers());
    await dispatch(pullAllQuarters());
    await dispatch(pullQuestions());
  }, [dispatch]);

  const handleRefresh = React.useCallback(async () => {
    await dispatch(pullSystemSettings());
    await dispatch(pullAllQuarters());
    await dispatch(pullQuestions());
    await dispatch(pullTransformers());
  }, [dispatch]);

  if (!show) return null;

  return (
    <Stack padding={0} flex={1} display={display} height={1}>
      <TabMenu>
        <Typography level="body-lg" pt={0.5} color="neutral"><i>Settings</i></Typography>
      </TabMenu>
      <Stack flex={1} flexShrink={1} overflow="scroll" p={3} gap={5}>
        <AdvancedSettings />
        <Stack direction="row" spacing={1} justifyContent="center" width={1}>
          <Button sx={{ borderRadius: 36, maxWidth: "400px", flex: 1 }} onClick={handleSave} size='lg' startDecorator={<SaveRounded />}>Save</Button>
          <IconButton sx={{ borderRadius: 36 }} onClick={handleRefresh} variant="outlined" size="lg">
            <RefreshRoundedIcon />
          </IconButton>
        </Stack>
      </Stack>
    </Stack>
  );
}

/** ------------------------------------------------------------------------- */

export default React.memo(SettingsTab);