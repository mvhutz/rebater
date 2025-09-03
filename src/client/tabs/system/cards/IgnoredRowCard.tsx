import React from 'react';
import { useAppSelector } from '../../../store/hooks';
import { getRunResults } from '../../../store/slices/system';
import AnalysisAccordion from '../AnalysisAccordion';
import NotificationsPausedRoundedIcon from '@mui/icons-material/NotificationsPausedRounded';
import { Card, CardOverflow, Chip, Divider, Stack, Tooltip, Typography } from '@mui/joy';
import { IgnoredRowIssue } from '../../../../shared/stats';
import { RowComponentProps, List as VirtualizedList } from 'react-window';

/** ------------------------------------------------------------------------- */

function IgnoredRowError({ issues, index, style }: RowComponentProps<{
  issues: IgnoredRowIssue[];
}>) {
  const issue = issues[index];

  return (
    <Stack style={style} divider={<Divider orientation='vertical' />} direction="row" alignItems="center" justifyContent="center">
      <Stack px={1} height={1} alignContent="center" justifyContent="center" textOverflow="ellipsis" overflow="hidden" whiteSpace="nowrap" width={100}>
        <Chip size='sm' variant="soft" color="primary">{issue.transformer}</Chip>
      </Stack>
      <Tooltip title={issue.reason}>
        <Typography level="body-sm" px={1} display="block" textOverflow="ellipsis" overflow="hidden" whiteSpace="nowrap" flex={1}>
          {issue.reason}
        </Typography>
      </Tooltip>
      <Tooltip title={issue.source}>
        <Typography level="body-sm" px={1} display="block" textOverflow="ellipsis" overflow="hidden" whiteSpace="nowrap" flex={1}>
          <code>{issue.source}</code>
        </Typography>
      </Tooltip>
    </Stack>
  )
}

/** ------------------------------------------------------------------------- */

function IgnoredRowCard() {
  const results = useAppSelector(getRunResults);
  if (results == null) return;

  const { issues: { ignored_row } } = results

  return (
    <AnalysisAccordion
      disabled={ignored_row.length === 0}
      amount={ignored_row.length}
      color="danger"
      title="Rejected Rows"
      subtitle="During execution, these rows where omitted from the output data. If these rows do contain data, you may have to omdify the transformers."
      icon={<NotificationsPausedRoundedIcon />}>
      <Card orientation="vertical" variant='outlined'>
        <CardOverflow sx={{ height: 300, p: 0 }}>
          <Stack alignItems="center" justifyContent="center" height={40} flexShrink={0} alignContent="center" direction="row" divider={<Divider orientation='vertical' />} width={1}>
            <Typography level="title-sm" px={1} width={100}>Transformer</Typography>
            <Typography level="title-sm" px={1} flex={1}>Error</Typography>
            <Typography level="title-sm" px={1} flex={1}>Source</Typography>
          </Stack>
          <Divider/>
          <Stack overflow="hidden">
            <VirtualizedList
              rowComponent={IgnoredRowError}
              rowCount={ignored_row.length}
              rowHeight={40}
              rowProps={{ issues: ignored_row }}
            />
          </Stack>
        </CardOverflow>
      </Card>
    </AnalysisAccordion>
  );
}

/** ------------------------------------------------------------------------- */

export default React.memo(IgnoredRowCard);
