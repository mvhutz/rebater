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
import { getNewQuarterModal, toggleNewQuarterModal } from '../store/slices/ui';
import { DialogActions, Option, Select } from '@mui/joy';
import { FormHelperText } from '@mui/material';
import { Time, TimeData, TimeSchema } from '../../shared/time';
import { getQuarterList } from '../store/slices/system';
import { addNewQuarter, pullAllQuarters } from '../store/slices/thunk';

/** ------------------------------------------------------------------------- */

function NewQuarterModal() {
  const open = useAppSelector(getNewQuarterModal);
  const all_quarters = useAppSelector(getQuarterList);
  const dispatch = useAppDispatch();

  const [copyQuarter, setCopyQuarter] = React.useState<TimeData | null>();
  const [year, setYear] = React.useState<string>("");
  const [quarter, setQuarter] = React.useState<number>(NaN);

  const new_parsed = React.useMemo(() => {
    return TimeSchema.safeParse({ quarter, year });
  }, [quarter, year]);

  const handleClose = React.useCallback(() => {
    dispatch(toggleNewQuarterModal());
    setCopyQuarter(null);
    setYear("");
    setQuarter(NaN);
  }, [dispatch]);

  const handleCreate = React.useCallback(async () => {
    if (!new_parsed.success) return;

    const reply = await dispatch(addNewQuarter({
      quarter: new_parsed.data,
      createStructureFrom: copyQuarter
    })).unwrap();

    if (reply.ok) {
      await dispatch(pullAllQuarters());
      handleClose();
    }
  }, [dispatch, handleClose, new_parsed, copyQuarter]);


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
              <Input value={year} placeholder='----' slotProps={{ input: { size: 1 } }} onChange={e => { setYear(e.target.value) }} />
              <FormHelperText>The quarter to process.</FormHelperText>
            </FormControl>
            <FormControl>
              <FormLabel>Quarter</FormLabel>
              <Select value={quarter} placeholder="--" onChange={(_, v) => { setQuarter(v ?? NaN) }}>
                <Option value={1}>Q1</Option>
                <Option value={2}>Q2</Option>
                <Option value={3}>Q3</Option>
                <Option value={4}>Q4</Option>
              </Select>
            </FormControl>
          </Stack>
          <FormControl>
            <FormLabel>Copy Directory From</FormLabel>
            <Select value={copyQuarter} onChange={(_, v) => { setCopyQuarter(v) }}>
              <Option value={null}>No Quarter</Option>
              {all_quarters.map(q => (
                <Option value={q}>{Time.asString(q)}</Option>
              ))}
            </Select>
            <FormHelperText>Optionally, copy the directory structure (excluding files) of a selected quarter's sources.</FormHelperText>
          </FormControl>
        </Stack>
        <DialogActions>
          <Button type="submit" onClick={handleCreate} disabled={!new_parsed.success}>Create</Button>
          <Button type="submit" color="neutral" variant="outlined" onClick={handleClose}>Cancel</Button>
        </DialogActions>
      </ModalDialog>
    </Modal>
  );
}

/** ------------------------------------------------------------------------- */

export default React.memo(NewQuarterModal);
