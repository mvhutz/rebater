import React from 'react';
import CircularProgress from '@mui/joy/CircularProgress';
import Stack from '@mui/joy/Stack';
import NightsStayRoundedIcon from '@mui/icons-material/NightsStayRounded';
import DoneRoundedIcon from '@mui/icons-material/DoneRounded';
import PriorityHighRoundedIcon from '@mui/icons-material/PriorityHighRounded';
import { getSystemStatus } from '../../store/slices/system';
import BookmarkRoundedIcon from '@mui/icons-material/BookmarkRounded';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import HourglassEmptyRoundedIcon from '@mui/icons-material/HourglassEmptyRounded';
import ListItemDecorator from '@mui/joy/ListItemDecorator';
import Tab, { tabClasses } from '@mui/joy/Tab';
import TabList from '@mui/joy/TabList';
import Tabs from '@mui/joy/Tabs';
import { SxProps } from '@mui/joy/styles/types';
import { getTab, getVisible, pushMessage, setTab } from '../../store/slices/ui';
import SystemTab from './tabs/system/SystemTab';
import DocumentationTab from './tabs/documentation/DocumentationTab';
import { SystemStatus } from '../../../shared/worker/response';

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
  const tab = useAppSelector(getTab);
  const dispatch = useAppDispatch();

  const handleTab = React.useCallback((_: unknown, tab: Maybe<string | number>) => {
    switch (tab) {
      case "system":
      case "documentation":
        dispatch(setTab(tab));
        break;
      default:
        dispatch(pushMessage({ type: "error", text: `Invalid tab '${tab}'.` }));
        break;
    }
  }, [dispatch]);

  return (
    <Stack direction="column" component="main" overflow="auto" height="100vh" flex={1}>
      <Tabs size="sm" value={tab} onChange={handleTab} sx={{ flex: 1 }}>
        {show_tabs &&
          <TabList color="neutral" variant="soft" sx={TAB_LIST_SX} sticky="top">
            <Tab value="system" indicatorPlacement="top">
              <ListItemDecorator>
                <SystemIcon status={status} />
              </ListItemDecorator>
              System
            </Tab>
            <Tab value="documentation" indicatorPlacement="top">
              <ListItemDecorator>
                <BookmarkRoundedIcon />
              </ListItemDecorator>
              Documentation
            </Tab>
          </TabList>
        }
        <DocumentationTab />
        <SystemTab />
      </Tabs>
    </Stack>
  );
}

/** ------------------------------------------------------------------------- */

export default React.memo(ViewPane);
