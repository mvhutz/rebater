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
import { useAppDispatch, useAppSelector } from '../../../client/store/hooks';
import { getContextSettings, getQuarterList, setSystemQuarter, setSystemYear } from '../../../client/store/slices/system';
import { ResourceStatus } from '../../../shared/resource';
import moment from 'moment';
import { IconButton } from '@mui/joy';
import { toggleNewQuarterModal } from '../../store/slices/ui';

/** ------------------------------------------------------------------------- */

function ContextSettings() {
  const { year, quarter } = useAppSelector(getContextSettings);
  const { data: quarters, status: quarterStatus } = useAppSelector(getQuarterList);
  const dispatch = useAppDispatch();

  const handleQuarter = React.useCallback((_: unknown, new_quarter: Maybe<string>) => {
    console.log(new_quarter);
    const new_time = moment(new_quarter, "YYYY-QQ");
    dispatch(setSystemYear(new_time.year()));
    dispatch(setSystemQuarter(new_time.quarter()));
  }, [dispatch]);

  const handleNewQuarter = React.useCallback(() => {
    dispatch(toggleNewQuarterModal());
  }, [dispatch]);

  console.log(year, quarter, quarterStatus);

  const current_quarter = quarterStatus === ResourceStatus.LOADING || year == null || quarter == null ? null : `${year}-Q${quarter}`;
  console.log(quarterStatus === ResourceStatus.LOADING, year == null, quarter == null, current_quarter, quarters);

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
                disabled={quarterStatus === ResourceStatus.LOADING}
                placeholder={quarterStatus === ResourceStatus.LOADING ? "Loading..." : "None"}
                onChange={handleQuarter}>
                { quarterStatus === ResourceStatus.PRESENT && (
                  quarters.map(q => (
                    <Option value={`${q.year}-Q${q.quarter}`} key={`${q.year}-Q${q.quarter}`}>{q.year}-Q{q.quarter}</Option>
                  ))
                )}
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
