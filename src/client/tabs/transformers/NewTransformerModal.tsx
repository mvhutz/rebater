import React from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { getNewTransformerModal, pushMessage, toggleNewTransformerModal } from '../../store/slices/ui';
import Button from '@mui/joy/Button';
import DialogContent from '@mui/joy/DialogContent';
import DialogTitle from '@mui/joy/DialogTitle';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import Input from '@mui/joy/Input';
import Modal from '@mui/joy/Modal';
import ModalDialog from '@mui/joy/ModalDialog';
import Stack from '@mui/joy/Stack';
import { DialogActions, FormHelperText, Radio, RadioGroup } from '@mui/joy';
import { AdvancedTransformerData } from '../../../system/transformer/AdvancedTransformer';
import { pullTransformers } from '../../store/slices/thunk';

/** ------------------------------------------------------------------------- */

function generateAdvancedConfiguration(name: string): AdvancedTransformerData {
  return {
    name: name,
    tags: [],
    sources: [],
    requirements: [],
    preprocess: [],
    properties: [],
    postprocess: [],
    destination: []
  }
}

/** ------------------------------------------------------------------------- */

interface NewTransformerModalProps {
  onTransformer?: (filepath: string) => unknown;
}

const { invoke } = window.api;

function NewTransformerModal(props: NewTransformerModalProps) {
  const { onTransformer } = props;
  const open = useAppSelector(getNewTransformerModal);
  const dispatch = useAppDispatch();
  const [name, setName] = React.useState("");
  const [type, setType] = React.useState<"advanced">("advanced");

  const handleClose = React.useCallback(() => {
    dispatch(toggleNewTransformerModal());
  }, [dispatch]);

  const handleChangeType = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    switch (value) {
      case "advanced":
        setType(value);
        break;
      default:
        dispatch(pushMessage({ type: "error", text: `No transformer type ${value}` }));
        break;
    }
  }, [dispatch])

  const handleCreate = React.useCallback(async () => {
    switch (type) {
      case "advanced": {
        const config = generateAdvancedConfiguration(name);
        const reply = await invoke.createTransformer({
          name: name,
          configuration: JSON.stringify(config, null, 2),
        });

        if (!reply.ok) {
          dispatch(pushMessage({ type: "error", text: reply.reason }));
        } else {
          await dispatch(pullTransformers());
          onTransformer?.(reply.data);
        }
        break;
      }
    }

    dispatch(toggleNewTransformerModal());
  }, [dispatch, name, onTransformer, type]);

  return (
    <Modal open={open} onClose={handleClose}>
      <ModalDialog>
        <DialogTitle>Generate New Transformer</DialogTitle>
        <DialogContent>
          Fill in the form below to pre-fill a transformer configuration.
        </DialogContent>
        <Stack spacing={4}>
          <FormControl sx={{ flex: 1 }}>
            <FormLabel>Title</FormLabel>
            <Input value={name} placeholder='Give the transformer a name...' slotProps={{ input: { size: 1 } }} onChange={e => setName(e.target.value)} />
          </FormControl>
          <FormControl>
            <FormLabel>Transformer Format</FormLabel>
            <RadioGroup value={type} name="radio-buttons-group" sx={{ gap: 3 }} onChange={handleChangeType}>
              <FormControl sx={{ flexDirection: 'row', gap: 2, pl: 2 }}>
                <Radio value="basic" variant="outlined" overlay disabled />
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
