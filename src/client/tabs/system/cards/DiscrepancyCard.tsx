import Accordion from '@mui/joy/Accordion';
import AccordionDetails from '@mui/joy/AccordionDetails';
import AccordionSummary from '@mui/joy/AccordionSummary';
import ListItemContent from '@mui/joy/ListItemContent';
import Typography from '@mui/joy/Typography';
import BiotechIcon from '@mui/icons-material/Biotech';
import React from 'react';
import Chip from '@mui/joy/Chip';
import Sheet from '@mui/joy/Sheet';
import { getRunResults } from '../../../store/slices/system';
import { useAppSelector } from '../../../store/hooks';
import AnalysisAccordion from '../AnalysisAccordion';

/** ------------------------------------------------------------------------- */

function DiscrepancyCard() {
  const results = useAppSelector(getRunResults);
  if (results == null) return;

  return (
    <AnalysisAccordion title="Discrepancy" color="warning" subtitle="View similarity to expected results." icon={<BiotechIcon />}>
      {results.discrepancy.toSorted((a, b) => b.take.length - a.take.length).map(r => (
        <Accordion color="warning" variant="soft" key={r.name}>
          <AccordionSummary color="warning" variant="soft">
            <ListItemContent>
              <Typography level="title-sm" fontFamily="monospace">#{r.name}</Typography>
            </ListItemContent>
            <>
              {r.match !== 0 && <Chip color="neutral">={r.match}</Chip>}
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
    </AnalysisAccordion>
  );
}

/** ------------------------------------------------------------------------- */

export default React.memo(DiscrepancyCard);
