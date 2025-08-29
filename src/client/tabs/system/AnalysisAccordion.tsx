import React from 'react';
import Accordion from '@mui/joy/Accordion';
import AccordionDetails from '@mui/joy/AccordionDetails';
import AccordionSummary from '@mui/joy/AccordionSummary';
import Avatar from '@mui/joy/Avatar';
import ListItemContent from '@mui/joy/ListItemContent';
import Typography from '@mui/joy/Typography';
import { ColorPaletteProp } from '@mui/joy';

/** ------------------------------------------------------------------------- */

interface AnalysisAccordionProps {
  children?: React.ReactNode[] | React.ReactNode;
  title: string;
  subtitle: string;
  color: ColorPaletteProp;
  icon: React.ReactNode;
}

function AnalysisAccordion(props: AnalysisAccordionProps) {
  const { children, title, subtitle, icon, color } = props;

  return (
    <Accordion variant="soft" color={color} sx={{ borderRadius: 'lg', overflow: "hidden" }}>
      <AccordionSummary variant="soft" color={color} sx={{ borderRadius: 'lg', overflow: "hidden" }}>
        <Avatar color={color} variant="outlined">{icon}</Avatar>
        <ListItemContent>
          <Typography level="title-lg">{title}</Typography>
          <Typography level="body-sm">{subtitle}</Typography>
        </ListItemContent>
      </AccordionSummary>
      <AccordionDetails color={color} variant="soft">{children}</AccordionDetails>
    </Accordion>
  )
}

/** ------------------------------------------------------------------------- */

export default React.memo(AnalysisAccordion);