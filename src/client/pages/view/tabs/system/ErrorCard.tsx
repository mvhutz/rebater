import Accordion from '@mui/joy/Accordion';
import AccordionDetails from '@mui/joy/AccordionDetails';
import AccordionSummary from '@mui/joy/AccordionSummary';
import Avatar from '@mui/joy/Avatar';
import ListItemContent from '@mui/joy/ListItemContent';
import Stack from '@mui/joy/Stack';
import Typography from '@mui/joy/Typography';
import ErrorIcon from '@mui/icons-material/Error';
import React from 'react';

/** ------------------------------------------------------------------------- */

interface ErrorCardProps {
  message?: string;
}

function ErrorCard(props: ErrorCardProps) {
  const { message = "We don't seen to have any information on this error." } = props;
  return (
    <Accordion variant="soft" color="danger" sx={{ borderRadius: 'lg', overflow: "hidden" }}>
      <AccordionSummary variant="soft" color="danger" sx={{ borderRadius: 'lg', overflow: "hidden" }}>
        <Avatar color="danger" variant="outlined">
          <ErrorIcon />
        </Avatar>
        <ListItemContent>
          <Typography level="title-lg">Error</Typography>
          <Typography level="body-sm">See inside for more details.</Typography>
        </ListItemContent>
      </AccordionSummary>
      <AccordionDetails color="danger" variant="soft">
        <Stack overflow="scroll" pt={1}>
          <Typography component="code" sx={{ fontFamily: 'monospace', whiteSpace: "pre"}}>{message}</Typography>
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
}

/** ------------------------------------------------------------------------- */

export default React.memo(ErrorCard);
