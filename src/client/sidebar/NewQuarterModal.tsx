import React from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import Button from '@mui/joy/Button';
import DialogContent from '@mui/joy/DialogContent';
import DialogTitle from '@mui/joy/DialogTitle';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import Input from '@mui/joy/Input';
import Modal from '@mui/joy/Modal';
import ModalDialog from '@mui/joy/ModalDialog';
import Stack from '@mui/joy/Stack';
import { getNewQuarterModal, pushMessage, toggleNewQuarterModal } from '../store/slices/ui';
import { DialogActions, Option, Select, Switch } from '@mui/joy';
import { FormHelperText } from '@mui/material';
import { getSystemSettings } from '../store/slices/system';
import z from 'zod/v4';
import { TimeData } from '../../shared/time';

/** ------------------------------------------------------------------------- */

const TimeSchema: z.ZodType<TimeData> = z.strictObject({
  year: z.coerce.number(),
  quarter: z.literal([1, 2, 3, 4]),
});

/** ------------------------------------------------------------------------- */

const { invoke } = window.api;

function NewQuarterModal() {
  const open = useAppSelector(getNewQuarterModal);
  const { data: { context: current_quarter } } = useAppSelector(getSystemSettings);
  const dispatch = useAppDispatch();

  const [currentStructure, setCurrentStructure] = React.useState(false);
  const [year, setYear] = React.useState<string>("");
  const [quarter, setQuarter] = React.useState<number>(NaN);

  const handleReset = React.useCallback(() => {
    setCurrentStructure(false);
    setYear("");
    setQuarter(NaN);
  }, []);

  const { success: new_ready, data: new_time } = React.useMemo(() => {
    return TimeSchema.safeParse({ quarter, year });
  }, [quarter, year]);

  const { success: old_ready, data: old_time } = React.useMemo(() => {
    return TimeSchema.safeParse(current_quarter);
  }, [current_quarter]);

  const handleCreate = React.useCallback(async () => {
    if (!new_ready || (currentStructure && !old_ready)) return;

    const reply = await invoke.createQuarter({
      createStructureFrom: currentStructure ? old_time : undefined,
      quarter: new_time,
    });

    if (!reply.ok) {
      dispatch(pushMessage({ type: "error", text: reply.reason }));
    }

    dispatch(toggleNewQuarterModal());
    handleReset();
  }, [currentStructure, dispatch, new_ready, new_time, old_ready, old_time, handleReset]);

  const handleClose = React.useCallback(() => {
    dispatch(toggleNewQuarterModal());
  }, [dispatch]);

  return (
    <Modal open={open} onClose={handleClose}>
      <ModalDialog>
        <DialogTitle>Generate New Quarter</DialogTitle>
        <DialogContent>
          Fill in the form below to pre-fill a file structure for a new quarter.
        </DialogContent>
        <Stack spacing={4}>
          <Stack direction="row" spacing={2} pt={1}>
            <FormControl sx={{ flex: 1 }}>
              <FormLabel>Year</FormLabel>
              <Input value={year} placeholder='----' slotProps={{ input: { size: 1 } }} onChange={e => setYear(e.target.value)} />
              <FormHelperText>The quarter to process.</FormHelperText>
            </FormControl>
            <FormControl>
              <FormLabel>Quarter</FormLabel>
              <Select value={quarter} placeholder="--" onChange={(_, v) => setQuarter(v ?? NaN)}>
                <Option value={1}>Q1</Option>
                <Option value={2}>Q2</Option>
                <Option value={3}>Q3</Option>
                <Option value={4}>Q4</Option>
              </Select>
            </FormControl>
          </Stack>
          <FormControl>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <FormLabel>Copy Structure</FormLabel>
              <Switch checked={currentStructure} onChange={e => setCurrentStructure(e.target.checked)} />
            </Stack>
            <FormHelperText>Copy the directory structure (excluding files) of the current quarter's sources.</FormHelperText>
          </FormControl>
        </Stack>
        <DialogActions>
          <Button type="submit" onClick={handleCreate} disabled={!old_ready || !new_ready}>Create</Button>
          <Button type="submit" color="neutral" variant="outlined" onClick={handleClose}>Ignore</Button>
        </DialogActions>
      </ModalDialog>
    </Modal>
  );
}

/** ------------------------------------------------------------------------- */

export default React.memo(NewQuarterModal);
