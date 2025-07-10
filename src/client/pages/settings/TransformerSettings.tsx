import Accordion from '@mui/joy/Accordion';
import AccordionSummary from '@mui/joy/AccordionSummary';
import FlashOnRounded from '@mui/icons-material/FlashOnRounded';
import ListItemContent from '@mui/joy/ListItemContent';
import Typography from '@mui/joy/Typography';
import AccordionDetails from '@mui/joy/AccordionDetails';
import React from 'react';

/** ------------------------------------------------------------------------- */

function TransformerSettings() {
  return (
    <Accordion>
      <AccordionSummary variant="soft">
        <FlashOnRounded />
        <ListItemContent>
          <Typography level="title-lg">Transformers</Typography>
        </ListItemContent>
      </AccordionSummary>
      <AccordionDetails>
      </AccordionDetails>
    </Accordion>
  );
}

/** ------------------------------------------------------------------------- */

export default React.memo(TransformerSettings);
