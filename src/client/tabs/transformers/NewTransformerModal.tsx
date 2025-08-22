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
import { SimpleTransformerData } from '../../../system/transformer/SimpleTransformer';

/** ------------------------------------------------------------------------- */

function generateAdvancedConfiguration(name: string): AdvancedTransformerData {
  return {
    type: "advanced",
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

function generateBasicConfiguration(name: string, group: string): SimpleTransformerData {
  return {
    type: 'simple',
    name: name,
    group: group,
    source: {
      sheets: [],
      file: undefined
    },
    properties: {
      purchaseId: 'counter',
      transactionDate: {
        column: undefined,
        parse: undefined
      },
      supplierId: {
        value: undefined
      },
      memberId: {
        column: undefined
      },
      distributorName: {
        type: 'value',
        value: undefined
      },
      purchaseAmount: {
        column: undefined
      },
      rebateAmount: {
        column: undefined,
        multiplier: undefined
      },
      invoiceId: {
        column: undefined
      },
      invoiceDate: {
        column: undefined,
        parse: undefined
      }
    },
    options: {
      canadian_rebate: false,
      remove_null_rebates: false,
      additional_preprocessing: undefined,
      additional_postprocessing: undefined
    }
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
  const [group, setGroup] = React.useState("");
  const [type, setType] = React.useState<"advanced" | "basic">("basic");

  const handleClose = React.useCallback(() => {
    dispatch(toggleNewTransformerModal());
  }, [dispatch]);

  const handleChangeType = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    switch (value) {
      case "advanced":
      case "basic":
        setType(value);
        break;
      default:
        dispatch(pushMessage({ type: "error", text: `No transformer type ${value}` }));
        break;
    }
  }, [dispatch])

  const handleCreate = React.useCallback(async () => {
    if (name === "") {
      dispatch(pushMessage({ type: "error", text: "Name not specified!" }));
      return;
    }

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
      case "basic": {
        if (group === "") {
          dispatch(pushMessage({ type: "error", text: "Group not specified!" }));
          return;
        }

        const config = generateBasicConfiguration(name, group);
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
  }, [dispatch, group, name, onTransformer, type]);

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
                <Radio value="basic" variant="outlined" overlay />
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
            <Input disabled={type !== "basic"} value={group} placeholder='What group will this configuration be for?' slotProps={{ input: { size: 1 } }} onChange={e => setGroup(e.target.value)} />
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
