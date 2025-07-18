import Accordion from '@mui/joy/Accordion';
import AccordionDetails from '@mui/joy/AccordionDetails';
import AccordionSummary from '@mui/joy/AccordionSummary';
import Avatar from '@mui/joy/Avatar';
import ListItemContent from '@mui/joy/ListItemContent';
import Typography from '@mui/joy/Typography';
import BiotechIcon from '@mui/icons-material/Biotech';
import React from 'react';
import AccordionGroup from '@mui/joy/AccordionGroup';
import Chip from '@mui/joy/Chip';
import Sheet from '@mui/joy/Sheet';

/** ------------------------------------------------------------------------- */

interface DiscrepancyTableProps {
  data: DiscrepencyResult[];
}

function DiscrepancyTable(props: DiscrepancyTableProps) {
  const { data } = props;

  return (
    <Accordion variant="soft" color="warning" sx={{ borderRadius: 'lg', overflow: "hidden" }}>
      <AccordionSummary variant="soft" color="warning" sx={{ borderRadius: 'lg', overflow: "hidden" }}>
        <Avatar color="warning" variant="outlined">
          <BiotechIcon />
        </Avatar>
        <ListItemContent>
          <Typography level="title-lg">Discrepancy</Typography>
          <Typography level="body-sm">View similarity to expected results.</Typography>
        </ListItemContent>
      </AccordionSummary>
      <AccordionDetails color="warning" variant="soft">
        <AccordionGroup size='sm' color="warning" variant="soft">
          {data.filter(r => r.drop.length > 0 || r.take.length > 0).toSorted((a, b) => b.take.length - a.take.length).map(r => (
            <Accordion color="warning" variant="soft" key={r.name}>
              <AccordionSummary color="warning" variant="soft">
                <ListItemContent>
                  <Typography level="title-sm" fontFamily="monospace">#{r.name}</Typography>
                </ListItemContent>
                <>
                  {r.take.length !== 0 && <Chip color="success">+{r.take.length}</Chip>}
                  {r.drop.length !== 0 && <Chip color="danger">-{r.drop.length}</Chip>}
                </>
              </AccordionSummary>
              <AccordionDetails>
                <Sheet variant="outlined" sx={{ overflow: "scroll", p: 2, mt: 1, borderRadius: "md" }}>
                  <Typography fontFamily="monospace" color="success" whiteSpace="pre">
                    {r.take.join("\n")}
                  </Typography>
                  <Typography fontFamily="monospace" color="danger" whiteSpace="pre">
                    {r.drop.join("\n")}
                  </Typography>
                </Sheet>
              </AccordionDetails>
            </Accordion>
          ))}
        </AccordionGroup>
      </AccordionDetails>
    </Accordion>
  );
}

/** ------------------------------------------------------------------------- */

export default React.memo(DiscrepancyTable);
