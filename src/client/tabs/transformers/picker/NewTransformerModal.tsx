import React from 'react';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { getNewTransformerModal, pushError, toggleNewTransformerModal } from '../../../store/slices/ui';
import Button from '@mui/joy/Button';
import DialogContent from '@mui/joy/DialogContent';
import DialogTitle from '@mui/joy/DialogTitle';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import Input from '@mui/joy/Input';
import Modal from '@mui/joy/Modal';
import ModalDialog from '@mui/joy/ModalDialog';
import Stack from '@mui/joy/Stack';
import { Autocomplete, DialogActions, FormHelperText, Radio, RadioGroup } from '@mui/joy';
import { viewNewTransformer } from '../../../store/slices/thunk';
import { getTransformerGroups } from '../../../store/slices/system';

/** ------------------------------------------------------------------------- */

function NewTransformerModal() {
  const open = useAppSelector(getNewTransformerModal);
  const dispatch = useAppDispatch();
  const [name, setName] = React.useState("");
  const [group, setGroup] = React.useState("");
  const groups = useAppSelector(getTransformerGroups);
  const [type, setType] = React.useState<"advanced" | "simple">("simple");

  const handleClose = React.useCallback(() => {
    setName("");
    setGroup("");
    setType("simple");
    dispatch(toggleNewTransformerModal());
  }, [dispatch]);

  const handleChangeType = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    switch (value) {
      case "advanced": case "simple":
        setType(value);
        break;
      default:
        dispatch(pushError(`No transformer type ${value}`));
        break;
    }
  }, [dispatch])

  const handleCreate = React.useCallback(async () => {
    const generated = await dispatch(viewNewTransformer({ name, group, type })).unwrap();
    if (generated) handleClose();
  }, [dispatch, handleClose, group, name, type]);

  const group_names = groups.ok ? Object.keys(groups.data) : [];

  return (
    <Modal open={open} onClose={handleClose}>
      <ModalDialog>
        <DialogTitle>Generate New Transformer</DialogTitle>
        <DialogContent>
          Fill in the form below to pre-fill a transformer configuration.
        </DialogContent>
        <Stack spacing={2}>
          <FormControl sx={{ flex: 1 }}>
            <FormLabel>Title</FormLabel>
            <Input value={name} placeholder='Give the transformer a name...' slotProps={{ input: { size: 1 } }} onChange={e => setName(e.target.value)} />
          </FormControl>
          <FormControl>
            <FormLabel>Transformer Format</FormLabel>
            <RadioGroup value={type} name="radio-buttons-group" sx={{ gap: 3 }} onChange={handleChangeType}>
              <FormControl sx={{ flexDirection: 'row', gap: 2, pl: 2 }}>
                <Radio value="simple" variant="outlined" overlay />
                <div>
                  <FormLabel>Basic</FormLabel>
                  <FormHelperText>Best for simple rebate extractions.</FormHelperText>
                </div>
              </FormControl>
              <FormControl sx={{ flexDirection: 'row', gap: 2, pl: 2 }}>
                <Radio value="advanced" variant="outlined" overlay />
                <div>
                  <FormLabel>Advanced</FormLabel>
                  <FormHelperText>Granularly edit underlying transformer configuration, in JSON.</FormHelperText>
                </div>
              </FormControl>
            </RadioGroup>
          </FormControl>
          <FormControl sx={{ flex: 1 }}>
            <FormLabel>Group</FormLabel>
            <Autocomplete freeSolo options={group_names} disabled={type !== "simple"} value={group} placeholder='What group will this configuration be for?' slotProps={{ input: { size: 1 } }} onChange={(_, v) => setGroup(v ?? "")}/>
          </FormControl>
        </Stack>
        <DialogActions>
          <Button type="submit" onClick={handleCreate}>Create</Button>
          <Button type="submit" color="neutral" variant="outlined" onClick={handleClose}>Ignore</Button>
        </DialogActions>
      </ModalDialog>
    </Modal>
  );
}

/** ------------------------------------------------------------------------- */

export default React.memo(NewTransformerModal);
