import React from 'react';
import SupplierResultsTable from './SupplierResultsTable';
import CircularProgress from '@mui/joy/CircularProgress';
import Stack from '@mui/joy/Stack';
import Typography from '@mui/joy/Typography';
// import QuestionMarkRoundedIcon from '@mui/icons-material/QuestionMarkRounded';
import NightsStayRoundedIcon from '@mui/icons-material/NightsStayRounded';
import DoneRoundedIcon from '@mui/icons-material/DoneRounded';
import PriorityHighRoundedIcon from '@mui/icons-material/PriorityHighRounded';
import { getSystemProgress, getSystemStatus, getSystemStatusName, isSystemActive, isSystemLoading } from '../../../../store/slices/system';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import { type SvgIconOwnProps } from '@mui/material';
import AccordionGroup from '@mui/joy/AccordionGroup';
import UpdateRoundedIcon from '@mui/icons-material/UpdateRounded';
import ErrorCard from './ErrorCard';
import DiscrepancyTable from './DiscrepancyTable';
import HourglassEmptyRoundedIcon from '@mui/icons-material/HourglassEmptyRounded';
import TabMenu from '../../TabMenu';
import { getDisplayTab } from '../../../../../client/store/slices/ui';
import { Button } from '@mui/joy';
import FileOpenRoundedIcon from '@mui/icons-material/FileOpenRounded';
import { killSystem, pushSystemSettings, startSystem } from '../../../../../client/store/slices/thunk';
import BlockRounded from '@mui/icons-material/BlockRounded';
import { PlayArrowRounded } from '@mui/icons-material';
import { SystemStatus } from '../../../../../shared/worker/response';

/** ------------------------------------------------------------------------- */

const INNER_TEXT_ICON_SX: SvgIconOwnProps["sx"] = {
  fontSize: 100
}

function InnerText({ status }: { status: SystemStatus }) {
  switch (status.type) {
    case "done": return <DoneRoundedIcon sx={INNER_TEXT_ICON_SX} />;
    case "idle": return <NightsStayRoundedIcon sx={INNER_TEXT_ICON_SX} />;
    case "loading": return <HourglassEmptyRoundedIcon sx={INNER_TEXT_ICON_SX} />;
    // case "asking": return <QuestionMarkRoundedIcon sx={INNER_TEXT_ICON_SX} />;
    case "running": return `${(Math.round(100 * status.progress))}%`;
    case "error": return <PriorityHighRoundedIcon sx={INNER_TEXT_ICON_SX} />;
  }
}

/** ------------------------------------------------------------------------- */

const { invoke } = window.api;

function SystemTab() {
  const status = useAppSelector(getSystemStatus);
  const messageText = useAppSelector(getSystemStatusName);
  const progress = useAppSelector(getSystemProgress);
  const loading = useAppSelector(isSystemLoading);
  const display = useAppSelector(getDisplayTab("system"));

  const results = status.type === "done" ? status.results : null;

  const dispatch = useAppDispatch();
  const active = useAppSelector(isSystemActive);
  
  const handleRun = React.useCallback(async () => {
    await dispatch(pushSystemSettings());
    await dispatch(startSystem());
  }, [dispatch]);

  const handleCancel = React.useCallback(async () => {
    await dispatch(killSystem());
  }, [dispatch]);

  const handleOutput = React.useCallback(async () => {
    await invoke.openOutputFile();
  }, []);

  return (
    <Stack padding={0} display={display}>
      <TabMenu>
        <Typography level="body-lg" pt={0.5} color="neutral"><i>System:</i> {messageText}</Typography>
      </TabMenu>
      <Stack padding={2}>
        <Stack direction="column" gap={2} flexGrow={1} height="75vh" alignItems="center" position="relative">
          <Stack alignItems="center" flex={1} justifyContent="center" spacing={6}>
            <CircularProgress color="primary" variant="soft" value={progress} determinate={!loading} size="lg" sx={{ '--CircularProgress-size': '200px' }}>
              <InnerText status={status} />
            </CircularProgress>
            { status.type === "done"
              ? <Stack spacing={1} width={1}>
                <Button fullWidth size="lg" color="success" onClick={handleOutput} sx={{ borderRadius: 100 }} startDecorator={<FileOpenRoundedIcon/>}>View Output</Button>
                <Button fullWidth size="sm" variant="soft" color="neutral" onClick={handleRun} sx={{ borderRadius: 100 }} startDecorator={<UpdateRoundedIcon/>}>Redo</Button>
              </Stack>
              : active
                ? <Button fullWidth size="lg" variant="outlined" color="neutral" onClick={handleCancel} sx={{ borderRadius: 100 }} startDecorator={<BlockRounded/>}>Cancel</Button>
                : <Button fullWidth size="lg" onClick={handleRun} sx={{ borderRadius: 100 }} startDecorator={<PlayArrowRounded/>}>Start</Button>
            }
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