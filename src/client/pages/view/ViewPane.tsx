import React from 'react';
import CircularProgress from '@mui/joy/CircularProgress';
import Stack from '@mui/joy/Stack';
import NightsStayRoundedIcon from '@mui/icons-material/NightsStayRounded';
import DoneRoundedIcon from '@mui/icons-material/DoneRounded';
import PriorityHighRoundedIcon from '@mui/icons-material/PriorityHighRounded';
import { getSystemStatus } from '../../store/slices/system';
import BookmarkRoundedIcon from '@mui/icons-material/BookmarkRounded';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { SystemStatus } from '../../../shared/system_status';
import HourglassEmptyRoundedIcon from '@mui/icons-material/HourglassEmptyRounded';
import ListItemDecorator from '@mui/joy/ListItemDecorator';
import Tab, { tabClasses } from '@mui/joy/Tab';
import TabList from '@mui/joy/TabList';
import Tabs from '@mui/joy/Tabs';
import { SxProps } from '@mui/joy/styles/types';
import { getVisible, pushMessage } from '../../store/slices/ui';
import SystemTab from './tabs/system/SystemTab';
import DocumentationTab from './tabs/documentation/DocumentationTab';
import { Route, Routes, useLocation, useNavigate } from 'react-router';

/** ------------------------------------------------------------------------- */

function SystemIcon({ status }: { status: SystemStatus }) {
  switch (status.type) {
    case "done": return <DoneRoundedIcon />;
    case "idle": return <NightsStayRoundedIcon />;
    case "loading": return <HourglassEmptyRoundedIcon />;
    case "running": return <CircularProgress value={100 * status.progress} determinate color="neutral" size="sm" sx={{ '--CircularProgress-size': '20px' }} />
    case "error": return <PriorityHighRoundedIcon />;
  }
}

/** ------------------------------------------------------------------------- */



/** ------------------------------------------------------------------------- */

const TAB_LIST_SX: SxProps = {
  [`& .${tabClasses.root}`]: {
    '&[aria-selected="true"]': {
      bgcolor: 'background.surface',
      borderColor: 'divider',
      '&::before': {
        content: '""',
        display: 'block',
        position: 'absolute',
        height: 2,
        bottom: -2,
        left: 0,
        right: 0,
        bgcolor: 'background.surface',
      },
    },
  },
};

function ViewPane() {
  const status = useAppSelector(getSystemStatus);
  const { tabs: show_tabs } = useAppSelector(getVisible);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const location = useLocation();
  const handleTab = React.useCallback((_: unknown, tab: Maybe<string | number>) => {
    if (typeof tab !== "string") {
      dispatch(pushMessage({ type: "error", text: `Invalid tab '${tab}'.` }));
    } else {
      navigate(tab);
    }
  }, [dispatch, navigate]);

  return (
    <Stack direction="column" component="main" flex={1} overflow="scroll" height="100vh">
      <Tabs size="sm" value={location.pathname} onChange={handleTab}>
        {show_tabs && <TabList color="neutral" variant="soft" sx={TAB_LIST_SX} sticky="top">
          <Tab value="/system" indicatorPlacement="top">
            <ListItemDecorator>
              <SystemIcon status={status} />
            </ListItemDecorator>
            System
          </Tab>
          <Tab value="/documentation" indicatorPlacement="top">
            <ListItemDecorator>
              <BookmarkRoundedIcon />
            </ListItemDecorator>
            Documentation
          </Tab>
        </TabList>
        }
        <Routes>
          <Route index path="/system" element={<SystemTab />}/>
          <Route path="/documentation/:doc?" element={<DocumentationTab />}/>
        </Routes>
      </Tabs>
    </Stack>
  );
}

/** ------------------------------------------------------------------------- */

export default React.memo(ViewPane);
