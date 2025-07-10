import React from 'react';
import SupplierResultsTable from './SupplierResultsTable';
import CircularProgress from '@mui/joy/CircularProgress';
import Stack from '@mui/joy/Stack';
import Typography from '@mui/joy/Typography';
import NightsStayRoundedIcon from '@mui/icons-material/NightsStayRounded';
import DoneRoundedIcon from '@mui/icons-material/DoneRounded';
import PriorityHighRoundedIcon from '@mui/icons-material/PriorityHighRounded';
import { getSystemProgress, getSystemStatus, getSystemStatusName, isSystemLoading } from '../../store/slices/system';
import BookmarkRoundedIcon from '@mui/icons-material/BookmarkRounded';
import { useAppSelector } from '../../store/hooks';
import { type SvgIconOwnProps } from '@mui/material';
import AccordionGroup from '@mui/joy/AccordionGroup';
import ErrorCard from './ErrorCard';
import { SystemStatus } from '../../../shared/system_status';
import DiscrepancyTable from './DiscrepancyTable';
import HourglassEmptyRoundedIcon from '@mui/icons-material/HourglassEmptyRounded';
import { Dropdown, IconButton, ListItemDecorator, Menu, MenuButton, MenuItem, Tab, tabClasses, TabList, Tabs } from '@mui/joy';
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';

/** ------------------------------------------------------------------------- */

const INNER_TEXT_ICON_SX: SvgIconOwnProps["sx"] = {
  fontSize: 100
}

function InnerText({ status }: { status: SystemStatus }) {
  switch (status.type) {
    case "done": return <DoneRoundedIcon sx={INNER_TEXT_ICON_SX} />;
    case "idle": return <NightsStayRoundedIcon sx={INNER_TEXT_ICON_SX} />;
    case "loading": return <HourglassEmptyRoundedIcon sx={INNER_TEXT_ICON_SX} />;
    case "running": return `${(Math.round(100 * status.progress))}%`;
    case "error": return <PriorityHighRoundedIcon sx={INNER_TEXT_ICON_SX} />;
  }
}

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

function RunPane() {
  const status = useAppSelector(getSystemStatus);
  const messageText = useAppSelector(getSystemStatusName);
  const progress = useAppSelector(getSystemProgress);
  const loading = useAppSelector(isSystemLoading);
  const [tab, setTab] = React.useState("system");

  const results = status.type === "done" ? status.results : null;

  return (
    <Stack direction="column" component="main" flex={1} overflow="scroll" height="100vh">
      <Tabs size="sm" value={tab} onChange={(_, v) => setTab(`${v}`)}>
        <TabList color="neutral" variant="soft" sx={{
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
        }}>
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
      </Tabs>
      {tab === "system" &&
        <Stack padding={0}>
          <Stack padding={1}>
          <Stack direction="row" justifyContent="center" alignItems="center" position="relative">
            <Typography level="title-md" pt={0.5} color="neutral"><code>Status</code></Typography>
            <Dropdown>
              <MenuButton sx={{ position: "absolute", right: 0, top: 0 }}
                slots={{ root: IconButton }}
                slotProps={{ "root": { variant: 'plain', color: 'neutral' } }}
              ><MoreVertRoundedIcon /></MenuButton>
              <Menu size='sm' placement="bottom-end">
                <MenuItem>Hide Topbar</MenuItem>
                <MenuItem>Hide Sidebar</MenuItem>
              </Menu>
            </Dropdown>
            </Stack>
          </Stack>
          <Stack padding={2}>
            <Stack direction="column" gap={2} flexGrow={1} height="85vh" alignItems="center" position="relative">
              <Stack alignItems="center" flex={1} justifyContent="center" gap={3}>
                <CircularProgress color="primary" variant="soft" value={progress} determinate={!loading} size="lg" sx={{ '--CircularProgress-size': '200px' }}>
                  <InnerText status={status} />
                </CircularProgress>
                <Typography level="body-lg" color="neutral">{messageText}</Typography>
              </Stack>
            </Stack>
            <AccordionGroup variant="plain" transition="0.2s" size='lg' disableDivider sx={{ gap: 2 }}>
              {results && <SupplierResultsTable data={results} />}
              {(results?.discrepency != null) && <DiscrepancyTable data={results.discrepency} />}
              {status.type === "error" && <ErrorCard message={status.message} />}
            </AccordionGroup>
          </Stack>
        </Stack>
      }
    </Stack>
  );
}

/** ------------------------------------------------------------------------- */

export default React.memo(RunPane);
