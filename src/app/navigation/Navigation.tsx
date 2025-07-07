import React from 'react';
import HomeRounded from '@mui/icons-material/HomeRounded';
import Box from '@mui/joy/Box';
import List from '@mui/joy/List';
import SettingsRounded from '@mui/icons-material/SettingsRounded';
import { type SxProps } from '@mui/joy/styles/types';
import NavigationItem from './NavigationItem';
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing';

/** ------------------------------------------------------------------------- */

const NAVIGATION_SX: SxProps = {
  padding: 1,
  borderRight: 0,
  borderTop: 0,
  borderLeft: 0,
  gap: 1,
  position: "sticky"
}

function Navigation() {
  return (
    <List role="menubar" orientation="horizontal" variant="outlined" component="nav" sx={NAVIGATION_SX}>
      <NavigationItem icon={HomeRounded} label="Home" path="/" />
      <Box sx={{ width: '100%', flexGrow: 1 }} />
      <NavigationItem icon={PrecisionManufacturingIcon} label="Processor" path="/processor" />
      <NavigationItem icon={SettingsRounded} label="Settings" path="/settings" />
    </List>
  );
}

/** ------------------------------------------------------------------------- */

export default React.memo(Navigation);
