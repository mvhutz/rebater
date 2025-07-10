import React from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { isSystemActive } from '../../store/slices/system';
import AccordionGroup from '@mui/joy/AccordionGroup';
import Button from '@mui/joy/Button';
import IconButton from '@mui/joy/IconButton';
import ListDivider from '@mui/joy/ListDivider';
import Stack from '@mui/joy/Stack';
import Sheet from '@mui/joy/Sheet';
import { SxProps } from '@mui/joy/styles/types';
import PlayArrowRounded from '@mui/icons-material/PlayArrowRounded';
import ContextSettings from './ContextSettings';
import TransformerSettings from './TransformerSettings';
import AdvancedSettings from './AdvancedSettings';
import { SaveRounded } from '@mui/icons-material';
import { pullTransformers, pushSystemSettings, startSystem } from '../../../client/store/slices/thunk';

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
  const active = useAppSelector(isSystemActive);

  const handleRun = React.useCallback(() => {
    dispatch(startSystem());
  }, [dispatch]);

  const handleSave = React.useCallback(async () => {
    await dispatch(pushSystemSettings());
    await dispatch(pullTransformers());
  }, [dispatch]);

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
        <ListDivider/>
        <Stack padding={1} direction="row" spacing={1}>
          <Button onClick={handleRun} fullWidth startDecorator={<PlayArrowRounded/>} variant="solid" size='sm' loading={active} loadingIndicator="Running...">Start</Button>
          <IconButton onClick={handleSave} variant="outlined" size='sm'><SaveRounded/></IconButton>
        </Stack>
      </Stack>
    </Sheet >
  );
}

/** ------------------------------------------------------------------------- */

export default React.memo(SettingsPane);