import React from 'react';
import DiscrepancyTable from './DiscrepancyTable';
import SupplierResultsTable from './SupplierResultsTable';
import PlayArrowRounded from '@mui/icons-material/PlayArrowRounded';
import Button from '@mui/joy/Button';
import Card from '@mui/joy/Card';
import CircularProgress from '@mui/joy/CircularProgress';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import Input from '@mui/joy/Input';
import Option from '@mui/joy/Option';
import Select from '@mui/joy/Select';
import Stack from '@mui/joy/Stack';
import { Typography } from '@mui/joy';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import NightsStayRoundedIcon from '@mui/icons-material/NightsStayRounded';
import DoneRoundedIcon from '@mui/icons-material/DoneRounded';
import PriorityHighRoundedIcon from '@mui/icons-material/PriorityHighRounded';
import { getSystemProgress, getSystemSettings, getSystemStatus, getSystemStatusName, isSystemLoading, startSystem } from '../../../client/store/slices/system';
import { useAppDispatch, useAppSelector } from '../../../client/store/hooks';
import { RunnerStatus } from 'src/system/Runner';

/** ------------------------------------------------------------------------- */

function InnerText({ status }: { status: RunnerStatus }) {
  switch (status.type) {
    case "done":    return <DoneRoundedIcon fontSize="large" />;
    case "idle":    return <NightsStayRoundedIcon fontSize="large" />;
    case "loading": return <HourglassEmptyIcon fontSize="large" />;
    case "running": return `${(Math.round(100 * status.progress))}%`;
    case "error":   return <PriorityHighRoundedIcon fontSize="large" />;
  }
}

/** ------------------------------------------------------------------------- */

function RunPage() {
  const status = useAppSelector(getSystemStatus);
  const dispatch = useAppDispatch();

  const messageText = useAppSelector(getSystemStatusName);
  const progress = useAppSelector(getSystemProgress);
  const loading = useAppSelector(isSystemLoading);

  const handleRun = React.useCallback(() => {
    dispatch(startSystem());
  }, [dispatch]);

  const running = status.type === "running";
  const results = status.type === "done" ? status.results : null;

  return (
    <Stack direction="column" component="main" alignItems="center" padding={2}>
      <Card variant="solid" color="primary" sx={{ padding: 3, minWidth: "400px", gap: 4, borderRadius: 40 }} invertedColors orientation="horizontal">
        <Stack direction="column" gap={2} flexGrow={1} alignItems="center">
          <Typography level="h3">Processor</Typography>
          <CircularProgress color="primary" variant="soft" value={progress} determinate={!loading} size="lg" sx={{ '--CircularProgress-size': '100px' }}>
            <InnerText status={status}/>
          </CircularProgress>
          <Typography>{messageText}</Typography>
        </Stack>
        <Stack direction="column" gap={2} maxWidth={150} justifyContent="space-between">
          <Stack direction="column" gap={1}>
            <Typography level="body-xs">CONTROLS</Typography>
            <Input variant="plain" placeholder="Year..." onChange={() => {}} endDecorator={<CalendarMonthIcon fontSize="small" color="inherit" />} />
            <Select placeholder="Quarter..." variant="plain" onChange={() => {}}>
              <Option value="1">Q1</Option>
              <Option value="2">Q2</Option>
              <Option value="3">Q3</Option>
              <Option value="4">Q4</Option>
            </Select>
          </Stack>
          <Button loading={running} onClick={handleRun} startDecorator={<PlayArrowRounded/>} loadingIndicator="Loading…" sx={{ borderRadius: 30 }}>
            Start
          </Button>
        </Stack>
      </Card>
      { results && <SupplierResultsTable data={results}/> }
      { results && <DiscrepancyTable data={results}/> }
      { status.type === "error" && <section>
        <h2>ERROR!</h2>
        <code>
          {status.message}
        </code>
      </section> }
    </Stack>
  );
}

/** ------------------------------------------------------------------------- */

export default React.memo(RunPage);
