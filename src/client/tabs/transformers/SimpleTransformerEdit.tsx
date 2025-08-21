import React from 'react';
import Stack from '@mui/joy/Stack';
import Typography from '@mui/joy/Typography';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import RestoreRoundedIcon from '@mui/icons-material/RestoreRounded';
import { Button, IconButton, Chip, ChipDelete, FormControl, FormLabel, Textarea } from '@mui/joy';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import { useAppDispatch } from '../../store/hooks';
import { pullTransformers } from '../../store/slices/thunk';
import { SimpleTransformerFileInfo } from '../../../system/transformer/BaseTransformers';
import { SimpleTransformerData } from '../../../system/transformer/SimpleTransformer';

/** ------------------------------------------------------------------------- */

interface MultiSelectProps {
  values: string[];
  onValues: (v: string[]) => void;
  placeholder?: string;
}

function MultiSelect_(props: MultiSelectProps) {
  const { values, onValues, placeholder } = props;
  const [text, setText] = React.useState("");

  const handleDelete = React.useCallback((index: number) => {
    onValues(values.toSpliced(index, 1));
  }, [onValues, values]);

  const handleKeyDown = React.useCallback<React.KeyboardEventHandler<HTMLTextAreaElement>>(e => {
    if (e.key !== 'Enter') return;

    e.preventDefault();
    e.stopPropagation();

    setText(t => {
      onValues(values.concat([t]))
      return "";
    })
  }, [onValues, values]);

  return <Stack direction="column" spacing={1}>
    <Textarea placeholder={placeholder} value={text} onChange={e => setText(e.target.value)} onKeyDown={handleKeyDown} endDecorator={
      <Stack direction="row" flexWrap="wrap" gap={0.5}>
        {values.map((v, i) => (
          <Chip endDecorator={<ChipDelete onDelete={() => handleDelete(i)} />}>{v}</Chip>
        ))}
      </Stack>
    } />
  </Stack>
}

const MultiSelect = React.memo(MultiSelect_);

/** ------------------------------------------------------------------------- */

const { invoke } = window.api;

interface SimpleTransformerEditProps {
  info: SimpleTransformerFileInfo;
}

function AdvancedTransformerEdit(props: SimpleTransformerEditProps) {
  const { info } = props;
  const [data, setData] = React.useState<SimpleTransformerData>(info.data);
  const dispatch = useAppDispatch();

  React.useEffect(() => {
    setData(info.data);
  }, [info.data]);

  const handleRevert = React.useCallback(() => {
    setData(info.data);
  }, [info.data]);

  const handleSave = React.useCallback(async () => {
    await invoke.updateTransformer({ filepath: info.path, configuration: JSON.stringify(data, null, 2) });
    await dispatch(pullTransformers());
  }, [dispatch, info.path, data]);

  const handleDelete = React.useCallback(async () => {
    await invoke.deleteTransformer({ filepath: info.path });
    await dispatch(pullTransformers());
  }, [dispatch, info.path]);

  return (
    <Stack padding={2} width={1} boxSizing="border-box" spacing={2} position="relative">
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography level="h3">Configuration</Typography>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" color="neutral" startDecorator={<SaveRoundedIcon />} onClick={handleSave}>Save</Button>
          <Button variant="outlined" color="neutral" startDecorator={<RestoreRoundedIcon />} onClick={handleRevert}>Revert</Button>
          <IconButton variant='outlined' color="danger" onClick={handleDelete}>
            <DeleteRoundedIcon />
          </IconButton>
        </Stack>
      </Stack>
      <Stack spacing={2}>
          <FormControl sx={{ flex: 1 }}>
            <FormLabel>Title</FormLabel>
            <MultiSelect placeholder="Input sheet names..." values={data.source.sheets} onValues={v => setData(d => ({...d, source: { ...d.source, sheets: v }}))}/>
          </FormControl>
        </Stack>
    </Stack>
  );
}

/** ------------------------------------------------------------------------- */

export default React.memo(AdvancedTransformerEdit);