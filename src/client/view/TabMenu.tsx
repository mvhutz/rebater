import React from 'react';
import Stack from '@mui/joy/Stack';
import Dropdown from '@mui/joy/Dropdown';
import IconButton from '@mui/joy/IconButton';
import Menu from '@mui/joy/Menu';
import MenuButton from '@mui/joy/MenuButton';
import MenuItem from '@mui/joy/MenuItem';
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { getVisible, toggleSettings, toggleTabs } from '../store/slices/ui';

/** ------------------------------------------------------------------------- */

interface TabMenuProps {
  children?: React.ReactNode[] | React.ReactNode;
}

function TabMenu(props: TabMenuProps) {
  const { children } = props;

  const { tabs: show_tabs, settings: show_settings } = useAppSelector(getVisible);

  const dispatch = useAppDispatch();

  const handleToggleTabs = React.useCallback(() => {
    dispatch(toggleTabs());
  }, [dispatch]);

  const handleToggleSettings = React.useCallback(() => {
    dispatch(toggleSettings());
  }, [dispatch]);

  return (
    <Stack padding={1}>
        <Stack direction="row" justifyContent="center" alignItems="center" position="relative" spacing={1}>
          {children}
          <Dropdown>
            <MenuButton sx={{ position: "absolute", right: 0, top: 0 }} slots={{ root: IconButton }} slotProps={{ "root": { variant: 'plain', color: 'neutral' } }}>
              <MoreVertRoundedIcon />
            </MenuButton>
            <Menu size='sm' placement="bottom-end">
              <MenuItem onClick={handleToggleTabs}>{show_tabs ? "Hide" : "Show"} Tabs</MenuItem>
              <MenuItem onClick={handleToggleSettings}>{show_settings ? "Hide" : "Show"} Settings</MenuItem>
            </Menu>
          </Dropdown>
        </Stack>
      </Stack>
  );
}

/** ------------------------------------------------------------------------- */

export default React.memo(TabMenu);