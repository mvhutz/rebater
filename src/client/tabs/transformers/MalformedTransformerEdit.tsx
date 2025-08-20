import React from 'react';
import Stack from '@mui/joy/Stack';
import Typography from '@mui/joy/Typography';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import { MalformedTransformerFileInfo } from '../../../system/transformer/AdvancedTransformer';
import RestoreRoundedIcon from '@mui/icons-material/RestoreRounded';
import { Alert, Textarea, Button, IconButton } from '@mui/joy';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import ErrorIcon from '@mui/icons-material/Error';

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

interface MalformedTransformerEditProps {
  info: MalformedTransformerFileInfo;
}

function MalformedTransformerEdit(props: MalformedTransformerEditProps) {
  const { info } = props;
  const [text, setText] = React.useState(info.text);

  const handleText = React.useCallback<React.ChangeEventHandler<HTMLTextAreaElement>>((e) => {
    setText(e.target.value);
  }, []);

  const handleRevert = React.useCallback(() => {
    setText(info.text);
  }, [info.text]);

  return (
    <Stack padding={2} width={1} boxSizing="border-box" spacing={2} position="relative">
      <Stack direction="row" justifyContent="space-between">
        <Typography level="h3">Configuration</Typography>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" color="neutral" startDecorator={<SaveRoundedIcon/>}>Save</Button>
          <Button variant="outlined" color="neutral" startDecorator={<RestoreRoundedIcon/>} onClick={handleRevert}>Revert</Button>
          <IconButton variant='outlined' color="danger">
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