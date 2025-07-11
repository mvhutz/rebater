import React from 'react';
import SupplierResultsTable from './SupplierResultsTable';
import CircularProgress from '@mui/joy/CircularProgress';
import Stack from '@mui/joy/Stack';
import Typography from '@mui/joy/Typography';
import NightsStayRoundedIcon from '@mui/icons-material/NightsStayRounded';
import DoneRoundedIcon from '@mui/icons-material/DoneRounded';
import PriorityHighRoundedIcon from '@mui/icons-material/PriorityHighRounded';
import { getSystemProgress, getSystemStatus, getSystemStatusName, isSystemLoading } from '../../../../store/slices/system';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import { type SvgIconOwnProps } from '@mui/material';
import AccordionGroup from '@mui/joy/AccordionGroup';
import ErrorCard from './ErrorCard';
import { SystemStatus } from '../../../../../shared/system_status';
import DiscrepancyTable from './DiscrepancyTable';
import HourglassEmptyRoundedIcon from '@mui/icons-material/HourglassEmptyRounded';
import { Dropdown, IconButton, Menu, MenuButton, MenuItem } from '@mui/joy';
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';
import { getVisible, toggleSettings, toggleTabs } from '../../../../store/slices/ui';

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

/** ------------------------------------------------------------------------- */

function SystemTab() {
  const status = useAppSelector(getSystemStatus);
  const messageText = useAppSelector(getSystemStatusName);
  const progress = useAppSelector(getSystemProgress);
  const loading = useAppSelector(isSystemLoading);
  const { tabs: show_tabs, settings: show_settings } = useAppSelector(getVisible);

  const dispatch = useAppDispatch();

  const handleToggleTabs = React.useCallback(() => {
    dispatch(toggleTabs());
  }, [dispatch]);

  const handleToggleSettings = React.useCallback(() => {
    dispatch(toggleSettings());
  }, [dispatch]);

  const results = status.type === "done" ? status.results : null;

  return (
    <Stack padding={0}>
      <Stack padding={1}>
        <Stack direction="row" justifyContent="center" alignItems="center" position="relative">
          {/* <Typography level="title-md" pt={0.5} color="neutral"><code>Status</code></Typography> */}
          <Typography level="body-lg" pt={0.5} color="neutral">{messageText}</Typography>
          <Dropdown>
            <MenuButton sx={{ position: "absolute", right: 0, top: 0 }}
              slots={{ root: IconButton }}
              slotProps={{ "root": { variant: 'plain', color: 'neutral' } }}
            ><MoreVertRoundedIcon /></MenuButton>
            <Menu size='sm' placement="bottom-end">
              <MenuItem onClick={handleToggleTabs}>{show_tabs ? "Hide" : "Show"} Tabs</MenuItem>
              <MenuItem onClick={handleToggleSettings}>{show_settings ? "Hide" : "Show"} Settings</MenuItem>
            </Menu>
          </Dropdown>
        </Stack>
      </Stack>
      <Stack padding={2}>
        <Stack direction="column" gap={2} flexGrow={1} height="70vh" alignItems="center" position="relative">
          <Stack alignItems="center" flex={1} justifyContent="center" gap={3}>
            <CircularProgress color="primary" variant="soft" value={progress} determinate={!loading} size="lg" sx={{ '--CircularProgress-size': '200px' }}>
              <InnerText status={status} />
            </CircularProgress>
          </Stack>
        </Stack>
        <AccordionGroup variant="plain" transition="0.2s" size='lg' disableDivider sx={{ gap: 2 }}>
          {results && <SupplierResultsTable data={results} />}
          {(results?.discrepency != null) && <DiscrepancyTable data={results.discrepency} />}
          {status.type === "error" && <ErrorCard message={status.message} />}
        </AccordionGroup>
      </Stack>
    </Stack>
  );
}

/** ------------------------------------------------------------------------- */

export default React.memo(SystemTab);