import ListItemButton from '@mui/joy/ListItemButton';
import ListItemDecorator from '@mui/joy/ListItemDecorator';
import { type SxProps } from '@mui/joy/styles/types';
import { type SvgIconComponent } from '@mui/icons-material';
import { Link, useLocation } from 'react-router';
import React from 'react';

/** ------------------------------------------------------------------------- */

interface NavigationItemProps {
  label: string;
  icon: SvgIconComponent
  path: string;
}

const NAVIGATION_ITEM_SX: SxProps = {
  borderRadius: 20
};

function NavigationItem(props: NavigationItemProps) {
  const { label, icon: Icon, path } = props;
  const { pathname } = useLocation();

  return (
    <ListItemButton role="menuitem" component={Link} to={path} selected={pathname === path} sx={NAVIGATION_ITEM_SX}>
      <ListItemDecorator>
        <Icon />
      </ListItemDecorator>
      {label}
    </ListItemButton>
  );
}

/** ------------------------------------------------------------------------- */

export default React.memo(NavigationItem);