import React from 'react';
import Stack from '@mui/joy/Stack';

/** ------------------------------------------------------------------------- */

interface TabMenuProps {
  children?: React.ReactNode[] | React.ReactNode;
}

function TabMenu(props: TabMenuProps) {
  const { children } = props;
  return (
    <Stack padding={1}>
      <Stack direction="row" justifyContent="center" alignItems="center" position="relative" spacing={2}>
        {children}
      </Stack>
    </Stack>
  );
}

/** ------------------------------------------------------------------------- */

export default React.memo(TabMenu);