import React from 'react';
import Stack from '@mui/joy/Stack';
import Typography from '@mui/joy/Typography';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import RestoreRoundedIcon from '@mui/icons-material/RestoreRounded';
import { Textarea, Button, IconButton } from '@mui/joy';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import { useAppDispatch } from '../../store/hooks';
import { pullTransformers } from '../../store/slices/thunk';
import { AdvancedTransformerFileInfo } from '../../../system/transformer/Transformer';

/** ------------------------------------------------------------------------- */

const { invoke } = window.api;

interface AdvancedTransformerEditProps {
  info: AdvancedTransformerFileInfo;
}

function AdvancedTransformerEdit(props: AdvancedTransformerEditProps) {
  const { info } = props;
  const [text, setText] = React.useState(JSON.stringify(info.data, null, 2));
  const dispatch = useAppDispatch();

  React.useEffect(() => {
    setText(JSON.stringify(info.data, null, 2));
  }, [info]);

  const handleText = React.useCallback<React.ChangeEventHandler<HTMLTextAreaElement>>((e) => {
    setText(e.target.value);
  }, []);

  const handleRevert = React.useCallback(() => {
    setText(JSON.stringify(info.data, null, 2));
  }, [info.data]);

  const handleSave = React.useCallback(async () => {
    await invoke.updateTransformer({ filepath: info.path, configuration: text });
    await dispatch(pullTransformers());
  }, [dispatch, info.path, text]);

  const handleDelete = React.useCallback(async () => {
    await invoke.deleteTransformer({ filepath: info.path });
    await dispatch(pullTransformers());
  }, [dispatch, info.path]);

  return (
    <Stack padding={2} width={1} boxSizing="border-box" spacing={2} position="relative">
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography level="h3">Configuration</Typography>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" color="neutral" startDecorator={<SaveRoundedIcon/>} onClick={handleSave}>Save</Button>
          <Button variant="outlined" color="neutral" startDecorator={<RestoreRoundedIcon/>} onClick={handleRevert}>Revert</Button>
          <IconButton variant='outlined' color="danger" onClick={handleDelete}>
            <DeleteRoundedIcon/>
          </IconButton>
        </Stack>
      </Stack>
      <Textarea variant='soft' minRows={2} value={text} onChange={handleText} sx={{ fontFamily: "monospace" }} size='sm' />
    </Stack>
  );
}

/** ------------------------------------------------------------------------- */

export default React.memo(AdvancedTransformerEdit);