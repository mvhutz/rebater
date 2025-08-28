import React from 'react';

import Accordion from '@mui/joy/Accordion';
import AccordionSummary from '@mui/joy/AccordionSummary';
import ListItemContent from '@mui/joy/ListItemContent';
import Typography from '@mui/joy/Typography';
import AccordionDetails from '@mui/joy/AccordionDetails';
import CropFreeRounded from '@mui/icons-material/CropFreeRounded';
import FormControl from '@mui/joy/FormControl';
import FormHelperText from '@mui/joy/FormHelperText';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import FormLabel from '@mui/joy/FormLabel';
import Option from '@mui/joy/Option';
import Select from '@mui/joy/Select';
import Stack from '@mui/joy/Stack';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { getDraftTime, getQuarterList, setDraftSystemTime } from '../store/slices/system';
import moment from 'moment';
import { IconButton } from '@mui/joy';
import { pushMessage, toggleNewQuarterModal } from '../store/slices/ui';
import { TimeSchema } from '../../shared/time';
import z from 'zod/v4';

/** ------------------------------------------------------------------------- */

function ContextSettings() {
  const time = useAppSelector(getDraftTime);
  const quarters = useAppSelector(getQuarterList);
  const dispatch = useAppDispatch();

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

  const current_quarter = time == null ? null : `${time.year}-Q${time.quarter}`;

  return (
    <Accordion>
      <AccordionSummary variant="soft">
        <CropFreeRounded />
        <ListItemContent>
          <Typography level="title-lg">Context</Typography>
        </ListItemContent>
      </AccordionSummary>
      <AccordionDetails>
          <Stack direction="row" spacing={1} pt={1}>
            <FormControl sx={{ flex: 1 }}>
              <FormLabel>Quarter</FormLabel>
              <Select
                value={current_quarter}
                disabled={quarters.length === 0}
                placeholder={"No quarter!"}
                onChange={handleQuarter}>
                {quarters.map(q => (
                  <Option value={`${q.year}-Q${q.quarter}`} key={`${q.year}-Q${q.quarter}`}>{q.year}-Q{q.quarter}</Option>
                ))}
              </Select>
              <FormHelperText>The quarter to process.</FormHelperText>
            </FormControl>
            <FormControl>
              <FormLabel>&nbsp;</FormLabel>
              <IconButton color="neutral" variant="outlined" onClick={handleNewQuarter}>
                <AddRoundedIcon fontSize="small" />
              </IconButton>
            </FormControl>
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
}

/** ------------------------------------------------------------------------- */

export default React.memo(ContextSettings);
