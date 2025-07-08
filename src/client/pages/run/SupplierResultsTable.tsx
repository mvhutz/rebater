import { Accordion, AccordionDetails, AccordionSummary, Avatar, Card, ListItemContent, Sheet, Stack, Table, Typography } from '@mui/joy';
import SpeedIcon from '@mui/icons-material/Speed';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import React from 'react';

/** ------------------------------------------------------------------------- */

interface SupplerResultsTableProps {
  data: RunResults;
}

function SupplerResultsTable(props: SupplerResultsTableProps) {
  const { data } = props;

  return (
    <Accordion variant="soft" color="success" sx={{ borderRadius: 'lg', overflow: "hidden" }}>
      <AccordionSummary variant="soft" color="success" sx={{ borderRadius: 'lg', overflow: "hidden" }}>
        <Avatar color="success" variant="outlined">
          <SpeedIcon />
        </Avatar>
        <ListItemContent>
          <Typography level="title-lg">Performance</Typography>
          <Typography level="body-sm">View the speed of different transformers.</Typography>
        </ListItemContent>
      </AccordionSummary>
      <AccordionDetails color="success" variant="soft">
        <Table size='sm' color="neutral" variant="soft" sx={{ mt: 2, borderRadius: "sm", overflow: "hidden" }}>
          <thead>
            <tr>
              <th>Supplier</th>
              <th>Time (ms)</th>
            </tr>
          </thead>
          <tbody>
            {data.config.map(r => <tr key={r.name}>
              <td>{r.name}</td>
              <td>{Math.round(r.end - r.start)}</td>
            </tr>)}
          </tbody>
        </Table>
      </AccordionDetails>
    </Accordion>
  );
}

/** ------------------------------------------------------------------------- */

export default React.memo(SupplerResultsTable);
