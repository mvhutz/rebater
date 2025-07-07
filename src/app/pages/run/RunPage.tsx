import React from 'react';
import SettingsContext from '../../context/SettingsContext';
import ProcessorContext from '../../context/ProcessorContext';
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

/** ------------------------------------------------------------------------- */

function RunPage() {
  const { settings } = React.useContext(SettingsContext);
  const { status, run } = React.useContext(ProcessorContext);

  const handleRun = React.useCallback(async () => {
    if (settings == null) {
      alert("Invalid settings!");
      return;
    }

    run(settings);
    console.log("Started!");
  }, [settings, run]);

  const running = status.type === "running";
  const results = status.type === "done" ? status.results : null;

  let innerText;
  let messageText;
  let progress;
  let determinate;

  switch (status.type) {
    case "done":
      innerText = <DoneRoundedIcon fontSize="large" />;
      messageText = "Done!";
      progress = 0;
      determinate = true;
      break;
    case "idle":
      innerText = <NightsStayRoundedIcon fontSize="large" />;
      messageText = "Idle";
      progress = 0;
      determinate = true;
      break;
    case "loading":
      innerText = <HourglassEmptyIcon fontSize="large" />;
      messageText = status.message ?? "Loading...";
      progress = 0;
      determinate = false;
      break;
    case "running":
      progress = 100 * status.progress;
      innerText = `${(Math.round(100 * status.progress))}%`;
      messageText = "Running transformers...";
      determinate = true;
      break;
    case "error":
      innerText = <PriorityHighRoundedIcon fontSize="large" />;
      messageText = "Error encountered!";
      determinate = true;
      progress = 0;
      break;
  }

  return (
    <Stack direction="column" component="main" alignItems="center" padding={2}>
      <Card variant="solid" color="primary" sx={{ padding: 3, minWidth: "400px", gap: 4, borderRadius: 40 }} invertedColors orientation="horizontal">
        <Stack direction="column" gap={2} flexGrow={1} alignItems="center">
          <Typography level="h3">Processor</Typography>
          <CircularProgress color="primary" variant="soft" value={progress} determinate={determinate} size="lg" sx={{ '--CircularProgress-size': '100px' }}>
            {innerText}
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
