import React from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import Button from '@mui/joy/Button';
import Stack from '@mui/joy/Stack';
import AdvancedSettings from './AdvancedSettings';
import { doPullAll, pushSystemSettings } from '../../store/slices/thunk';
import { getDisplayTab, getVisible } from '../../store/slices/ui';
import { Typography } from '@mui/joy';
import TabMenu from '../../view/TabMenu';

/** ------------------------------------------------------------------------- */

function SettingsTab() {
  const display = useAppSelector(getDisplayTab("settings"));
  const dispatch = useAppDispatch();
  const { settings: show } = useAppSelector(getVisible);

  const handleSave = React.useCallback(async () => {
    await dispatch(pushSystemSettings());
    await dispatch(doPullAll());
  }, [dispatch]);

  const handleRefresh = React.useCallback(async () => {
    await dispatch(doPullAll());
  }, [dispatch]);

  if (!show) return null;

  return (
    <Stack padding={0} flex={1} display={display} height={1}>
      <TabMenu>
        <Typography level="body-lg" pt={0.5} color="neutral"><i>Settings</i></Typography>
        <Stack direction="row" spacing={1} position="absolute" right={0}>
          <Button variant="solid" color='primary' size='sm' sx={{ borderRadius: 1000 }} onClick={handleSave}>
            Save
          </Button>
          <Button variant='outlined' color="neutral" size='sm' onClick={handleRefresh} sx={{ borderRadius: 1000 }}>
              Refresh
            </Button>
        </Stack>
      </TabMenu>
      <Stack flex={1} flexShrink={1} overflow="scroll" p={3} gap={5}>
        <AdvancedSettings />
      </Stack>
    </Stack>
  );
}

/** ------------------------------------------------------------------------- */

export default React.memo(SettingsTab);