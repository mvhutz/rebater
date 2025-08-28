import React from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import AccordionGroup from '@mui/joy/AccordionGroup';
import Button from '@mui/joy/Button';
import Stack from '@mui/joy/Stack';
import Sheet from '@mui/joy/Sheet';
import { SxProps } from '@mui/joy/styles/types';
import ContextSettings from './ContextSettings';
import TransformerSettings from './TransformerSettings';
import AdvancedSettings from './AdvancedSettings';
import { SaveRounded } from '@mui/icons-material';
import { pullAllQuarters, pullQuestions, pullSystemSettings, pullTransformers, pushSystemSettings } from '../../client/store/slices/thunk';
import { getVisible } from '../../client/store/slices/ui';
import { Divider, IconButton } from '@mui/joy';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import NewQuarterModal from './NewQuarterModal';

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

function SettingsPane() {
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
    <Sheet sx={SETTINGS_SX} variant="outlined" color="neutral">
      <Stack direction="column" height="100vh">
        <Stack flex={1} flexShrink={1} overflow="scroll">
          <Stack>
          <AccordionGroup variant="plain" transition="0.2s" size='lg'>
            <ContextSettings />
            <TransformerSettings />
            <AdvancedSettings />
          </AccordionGroup>
          </Stack>
          <Sheet variant='soft' sx={{ flex: 1 }}/>
        </Stack>
        <Divider />
        <Stack direction="row" spacing={1} sx={{ p: 1 }}>
          <Button onClick={handleSave} fullWidth variant="outlined" size='sm' color="neutral" startDecorator={<SaveRounded/>}>Save Settings</Button>
          <IconButton onClick={handleRefresh} variant="outlined">
            <RefreshRoundedIcon/>
          </IconButton>
        </Stack>
      </Stack>
      <NewQuarterModal/>
    </Sheet>
  );
}

/** ------------------------------------------------------------------------- */

export default React.memo(SettingsPane);