import React from 'react';
import Stack from '@mui/joy/Stack';
import Typography from '@mui/joy/Typography';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import { MalformedTransformerFileInfo } from '../../../system/transformer/AdvancedTransformer';
import RestoreRoundedIcon from '@mui/icons-material/RestoreRounded';
import { Alert, Textarea, Button, IconButton } from '@mui/joy';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import ErrorIcon from '@mui/icons-material/Error';
import { useAppDispatch } from '../../store/hooks';
import { pullTransformers } from '../../store/slices/thunk';

/** ------------------------------------------------------------------------- */

interface MalformedErrorProps {
  error: string
}

function MalformedError(props: MalformedErrorProps) {
  const { error } = props;

  return (
    <Stack sx={{ position: "sticky", bottom: 10 }} width={1} px={1} boxSizing="border-box">
      <Alert startDecorator={<ErrorIcon sx={{ fontSize: 25 }} />} sx={{ alignItems: 'flex-start', overflow: "scroll" }} color='danger' invertedColors variant="solid">
        <div>
          <div>Error</div>
          <Typography color="primary" level="body-sm" fontWeight="400" component="code" sx={{ fontFamily: 'monospace', overflowWrap: "break-word" }}>
            {error}
          </Typography>
        </div>
      </Alert>
    </Stack>
  );
}

/** ------------------------------------------------------------------------- */

const { invoke } = window.api;

interface MalformedTransformerEditProps {
  info: MalformedTransformerFileInfo;
}

function MalformedTransformerEdit(props: MalformedTransformerEditProps) {
  const { info } = props;
  const [text, setText] = React.useState(info.text);
  const dispatch = useAppDispatch();

  React.useEffect(() => {
    setText(info.text);
  }, [info]);

  const handleText = React.useCallback<React.ChangeEventHandler<HTMLTextAreaElement>>((e) => {
    setText(e.target.value);
  }, []);

  const handleRevert = React.useCallback(() => {
    setText(info.text);
  }, [info.text]);

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
      <MalformedError error={info.error}/>
    </Stack>
  );
}

/** ------------------------------------------------------------------------- */

export default React.memo(MalformedTransformerEdit);