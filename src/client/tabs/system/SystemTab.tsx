import React from 'react';
import PerformanceCard from './cards/PerformanceCard';
import CircularProgress from '@mui/joy/CircularProgress';
import Stack from '@mui/joy/Stack';
import Typography from '@mui/joy/Typography';
import NightsStayRoundedIcon from '@mui/icons-material/NightsStayRounded';
import DoneRoundedIcon from '@mui/icons-material/DoneRounded';
import PriorityHighRoundedIcon from '@mui/icons-material/PriorityHighRounded';
import { getDraftTime, getDraftTransformersSettings, getQuarterList, getSystemProgress, getSystemStatus, getSystemStatusName, getTransformers, isSystemLoading, setDraftSystemTime, setDraftTransformersNames, setDraftTransformersTags, setStatus } from '../../store/slices/system';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { type SvgIconOwnProps } from '@mui/material';
import UpdateRoundedIcon from '@mui/icons-material/UpdateRounded';
import ErrorCard from './cards/ErrorCard';
import DiscrepancyCard from './cards/DiscrepancyCard';
import HourglassEmptyRoundedIcon from '@mui/icons-material/HourglassEmptyRounded';
import TabMenu from '../../view/TabMenu';
import { getContextFilter, getDisplayTab, pushMessage, toggleContextFilter, toggleNewQuarterModal } from '../../store/slices/ui';
import { Badge, Box, Button, Chip, Divider, IconButton, Option, Select, Tooltip } from '@mui/joy';
import FileOpenRoundedIcon from '@mui/icons-material/FileOpenRounded';
import { killSystem, showOutputFile, startSystem } from '../../store/slices/thunk';
import BlockRounded from '@mui/icons-material/BlockRounded';
import { AddRounded, ClearRounded, PlayArrowRounded, TuneRounded } from '@mui/icons-material';
import { SystemStatus } from '../../../shared/worker/response';
import { TimeSchema } from '../../../shared/time';
import moment from 'moment';
import { z } from 'zod/v4';
import NoValidSourcesCard from './cards/NoValidSourcesCard';
import EmptySourceCard from './cards/EmptySourceCard';
import EmptyTableCard from './cards/EmptyTableCard';
import FailedTransformerCard from './cards/FailedTransformerCard';
import IgnoredRowCard from './cards/IgnoredRowCard';
import NoSourcesCard from './cards/NoSourcesCard';

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

function DoneMenu() {
  const dispatch = useAppDispatch();

  const handleOutput = React.useCallback(async () => {
    await dispatch(showOutputFile());
  }, [dispatch]);

  const handleRedo = React.useCallback(async () => {
    dispatch(setStatus({ type: "idle" }));
  }, [dispatch]);

  return (
    <Stack spacing={1} width={1} direction="row">
      <Button fullWidth size="lg" color="success" onClick={handleOutput} sx={{ borderRadius: 100 }} startDecorator={<FileOpenRoundedIcon />}>View Output</Button>
      <Tooltip title="Redo">
        <IconButton size="lg" variant="soft" color="neutral" onClick={handleRedo} sx={{ borderRadius: 100 }}>
          <UpdateRoundedIcon />
        </IconButton>
      </Tooltip>
    </Stack>
  );
}

function RunningMenu() {
  const dispatch = useAppDispatch();

  const handleExit = React.useCallback(async () => {
    await dispatch(killSystem());
  }, [dispatch]);

  const handleCancel = React.useCallback(async () => {
    await invoke.exitProgram({});
  }, []);

  return (
    <Stack spacing={1} width={1} direction="row">
      <Tooltip title="Force Kill Program">
        <IconButton onClick={handleExit} variant="outlined" color="danger" size="lg" sx={{ borderRadius: 100 }}>
          <ClearRounded />
        </IconButton>
      </Tooltip>
      <Button fullWidth size="lg" variant="outlined" color="neutral" onClick={handleCancel} sx={{ borderRadius: 100 }} startDecorator={<BlockRounded />}>
        Cancel
      </Button>
    </Stack>
  )
}

function IdleMenu() {
  const dispatch = useAppDispatch();

  const time = useAppSelector(getDraftTime);
  const quarters = useAppSelector(getQuarterList);
  const context_filter = useAppSelector(getContextFilter);

  const handleQuarter = React.useCallback((_: unknown, new_quarter: Maybe<string>) => {
    if (new_quarter == null) return;

    const new_time = moment(new_quarter, "YYYY-QQ");
    const time_reply = TimeSchema.safeParse({
      year: new_time.year(),
      quarter: new_time.quarter(),
    });

    if (!time_reply.success) {
      dispatch(pushMessage({ type: "error", text: z.prettifyError(time_reply.error) }));
      return;
    }

    dispatch(setDraftSystemTime(time_reply.data));
  }, [dispatch]);

  const handleNewQuarter = React.useCallback(() => {
    dispatch(toggleNewQuarterModal());
  }, [dispatch]);

  const handleRun = React.useCallback(async () => {
    await dispatch(startSystem());
  }, [dispatch]);

  const handleContextFilter = React.useCallback(() => {
    dispatch(toggleContextFilter());
  }, [dispatch]);

  const transformers_reply = useAppSelector(getTransformers);
  const {
    names: { include: selected_names = [] },
    tags: { include: selected_tags = [] }
  } = useAppSelector(getDraftTransformersSettings);

  const handleIncludeNames = React.useCallback((_: unknown, selected: string[]) => {
    dispatch(setDraftTransformersNames(selected));
  }, [dispatch]);

  const handleIncludeTags = React.useCallback((_: unknown, selected: string[]) => {
    dispatch(setDraftTransformersTags(selected));
  }, [dispatch]);

  const all_tags = React.useMemo(() => {
    if (!transformers_reply.ok) return [];
    const { data: transformers } = transformers_reply;
    const tags = transformers
      .map(t => t.data)
      .filter(t => t.ok)
      .map(t => t.data.type === "advanced" ? t.data.tags : [t.data.group])
      .flat();

    return new Set(tags);
  }, [transformers_reply]);

  const current_quarter = time == null ? null : `${time.year}-Q${time.quarter}`;

  return (
    <Stack spacing={2} width={1} direction="column">
      <Stack spacing={1} width={1}>
        <Stack direction="row" spacing={0.5}>
          <Select
            value={current_quarter}
            sx={{ flex: 1, borderRadius: 18 }}
            placeholder={"No quarter!"}
            indicator={null}
            endDecorator={
              <Tooltip title="Add New Quarter">
                <IconButton color="neutral" variant="soft" onClick={handleNewQuarter}>
                  <AddRounded fontSize="small" />
                </IconButton>
              </Tooltip>
            }
            onChange={handleQuarter}>
            {quarters.map(q => (
              <Option value={`${q.year}-Q${q.quarter}`} key={`${q.year}-Q${q.quarter}`}>{q.year}-Q{q.quarter}</Option>
            ))}
          </Select>
          <Tooltip title="Toggle Filters">
            <Badge invisible={selected_names.length === 0 && selected_tags.length === 0} badgeInset="14%">
              <IconButton onClick={handleContextFilter} sx={{ borderRadius: 18 }} variant={context_filter ? "soft" : "outlined"}>
                <TuneRounded fontSize="small" />
              </IconButton>
            </Badge>
          </Tooltip>
        </Stack>
        {context_filter && <Stack spacing={1}>
          <Stack spacing={0.5}>
            <Select
              multiple
              value={selected_names}
              onChange={handleIncludeNames}
              disabled={!transformers_reply.ok}
              sx={{ flex: 1, borderRadius: 18 }}
              variant="soft"
              placeholder={<Typography color="neutral">All Transformers</Typography>}
              renderValue={s => `${s.length} Transformers`}
            >
              {transformers_reply.ok &&
                transformers_reply.data.map(t => t.data.ok && (
                  <Option value={t.data.data.name} key={t.data.data.name}>{t.data.data.name}</Option>
                ))
              }
            </Select>
            {selected_names.length > 0 &&
              <Box sx={{ display: 'flex', gap: '0.125rem' }} flexWrap="wrap">
                {selected_names.map((selectedOption) => (
                  <Chip variant="soft" color="primary" size='sm'>
                    {selectedOption}
                  </Chip>
                ))}
              </Box>
            }
          </Stack>
          <Stack spacing={0.5}>
            <Select
              multiple
              value={selected_tags}
              onChange={handleIncludeTags}
              renderValue={s => `${s.length} Tags`}
              sx={{ flex: 1, borderRadius: 18 }}
              variant="soft"
              placeholder={<Typography color="neutral">Any Tags</Typography>}
            >
              {[...all_tags].map(t => (
                <Option value={t} key={t}>{t}</Option>
              ))}
            </Select>
            {selected_tags.length > 0 &&
              <Box sx={{ display: 'flex', gap: '0.125rem' }} flexWrap="wrap">
                {selected_tags.map((selectedOption) => (
                  <Chip variant="soft" color="primary" size='sm'>
                    {selectedOption}
                  </Chip>
                ))}
              </Box>
            }
          </Stack>
        </Stack>
        }
      </Stack>
      <Button disabled={time == null} fullWidth size="lg" onClick={handleRun} sx={{ borderRadius: 100 }} startDecorator={<PlayArrowRounded />}>Start</Button>
    </Stack>
  )
}

function SystemMenu() {
  const status = useAppSelector(getSystemStatus);

  switch (status.type) {
    case 'idle':
      return <IdleMenu />;
    case 'done': case 'error':
      return <DoneMenu />;
    case 'loading': case 'running':
      return <RunningMenu />;
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

  return (
    <Stack padding={0} display={display} overflow="scroll">
      <TabMenu>
        <Typography level="body-lg" pt={0.5} color="neutral"><i>System:</i> {messageText}</Typography>
      </TabMenu>
      <Stack padding={4} spacing={4} alignItems="center">
        <Stack direction="column" gap={2} spacing={6} pt={5} flexGrow={1} position="relative">
          <CircularProgress color="primary" variant="soft" value={progress} determinate={!loading} size="lg" sx={{ '--CircularProgress-size': '200px' }}>
            <InnerText status={status} />
          </CircularProgress>
          <SystemMenu />
        </Stack>
        <Stack direction="row" spacing={2}>
          <PerformanceCard />
          <DiscrepancyCard />
          <NoSourcesCard />
          <Divider orientation="vertical" />
          <ErrorCard />
          <NoValidSourcesCard />
          <EmptySourceCard />
          <EmptyTableCard />
          <FailedTransformerCard />
          <IgnoredRowCard />
        </Stack>
      </Stack>
    </Stack>
  );
}

/** ------------------------------------------------------------------------- */

export default React.memo(SystemTab);