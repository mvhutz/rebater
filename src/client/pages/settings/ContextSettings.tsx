import React from 'react';

import Accordion from '@mui/joy/Accordion';
import AccordionSummary from '@mui/joy/AccordionSummary';
import ListItemContent from '@mui/joy/ListItemContent';
import Typography from '@mui/joy/Typography';
import AccordionDetails from '@mui/joy/AccordionDetails';
import CropFreeRounded from '@mui/icons-material/CropFreeRounded';
import FormControl from '@mui/joy/FormControl';
import FormHelperText from '@mui/joy/FormHelperText';
import FormLabel from '@mui/joy/FormLabel';
import Input from '@mui/joy/Input';
import Option from '@mui/joy/Option';
import Select from '@mui/joy/Select';
import Stack from '@mui/joy/Stack';
import { useAppDispatch, useAppSelector } from '../../../client/store/hooks';
import { getContextSettings, setSystemQuarter, setSystemYear } from '../../../client/store/slices/system';

/** ------------------------------------------------------------------------- */

function ContextSettings() {
  const { year, quarter } = useAppSelector(getContextSettings);
  const dispatch = useAppDispatch();

  const handleYear = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(event.target.value);

    if (event.target.value === "") {
      dispatch(setSystemYear(null));
    } else if (!isNaN(value)) {
      dispatch(setSystemYear(value));
    }
  }, [dispatch]);

  const handleQuarter = React.useCallback((_: unknown, quarter: Maybe<number>) => {
    dispatch(setSystemQuarter(quarter));
  }, [dispatch]);

  return (
    <Accordion>
      <AccordionSummary variant="soft">
        <CropFreeRounded />
        <ListItemContent>
          <Typography level="title-lg">Context</Typography>
        </ListItemContent>
      </AccordionSummary>
      <AccordionDetails>
          <Stack direction="row" spacing={2} pt={1}>
            <FormControl sx={{ flex: 1 }}>
              <FormLabel>Year</FormLabel>
              <Input placeholder='----' value={year ?? ""} slotProps={{ input: { size: 1 } }} onChange={handleYear}/>
              <FormHelperText>The quarter to process.</FormHelperText>
            </FormControl>
            <FormControl >
              <FormLabel>Quarter</FormLabel>
              <Select value={quarter ?? null} placeholder="--" onChange={handleQuarter}>
                <Option value={1}>Q1</Option>
                <Option value={2}>Q2</Option>
                <Option value={3}>Q3</Option>
                <Option value={4}>Q4</Option>
              </Select>
            </FormControl>
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
}

/** ------------------------------------------------------------------------- */

export default React.memo(ContextSettings);
