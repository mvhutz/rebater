import React from 'react';
import Stack from '@mui/joy/Stack';
import Typography from '@mui/joy/Typography';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import RestoreRoundedIcon from '@mui/icons-material/RestoreRounded';
import { Textarea, Button, IconButton } from '@mui/joy';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import { useAppDispatch } from '../../store/hooks';
import { pullTransformers } from '../../store/slices/thunk';
import { TransformerFile } from '../../../shared/state/stores/TransformerStore';
import { AdvancedTransformerData, AdvancedTransformerSchema } from '../../../shared/transformer/advanced';
import { bad, good, GoodReply } from '../../../shared/reply';
import MalformedError from './MalformedError';
import z from 'zod/v4';

/** ------------------------------------------------------------------------- */

const { invoke } = window.api;

interface AdvancedTransformerEditProps {
  item: TransformerFile["item"];
  data: GoodReply<AdvancedTransformerData>
}

function AdvancedTransformerEdit(props: AdvancedTransformerEditProps) {
  const { item, data } = props;
  const [draft, setDraft] = React.useState(JSON.stringify(data.data, null, 2));
  const dispatch = useAppDispatch();

  const { success: transformer_ready, data: draft_transformer, error: draft_error } = React.useMemo(() => {
    try {
      const parsed = AdvancedTransformerSchema.safeParse(JSON.parse(draft));
      return { ...parsed, error: parsed.error && z.prettifyError(parsed.error) }
    } catch (err) {
      return { success: false, data: undefined, error: `${err}` };
    }
  }, [draft]);

  React.useEffect(() => {
    setDraft(JSON.stringify(data.data, null, 2));
  }, [data]);

  const handleText = React.useCallback<React.ChangeEventHandler<HTMLTextAreaElement>>((e) => {
    setDraft(e.target.value);
  }, []);

  const handleRevert = React.useCallback(() => {
    setDraft(JSON.stringify(data.data, null, 2));
  }, [data]);

  const handleSave = React.useCallback(async () => {
    if (draft_transformer == null) return;
    await invoke.updateTransformer({ item: item, data: good(draft_transformer) });
    await dispatch(pullTransformers());
  }, [dispatch, draft_transformer, item]);

  const handleDelete = React.useCallback(async () => {
    await invoke.deleteTransformer({ item: item, data: bad("") });
    await dispatch(pullTransformers());
  }, [dispatch, item]);

  return (
    <Stack padding={2} width={1} boxSizing="border-box" spacing={2} position="relative">
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography level="h3">Configuration</Typography>
        <Stack direction="row" spacing={1}>
          <Button disabled={!transformer_ready} variant="outlined" color="neutral" startDecorator={<SaveRoundedIcon/>} onClick={handleSave}>Save</Button>
          <Button variant="outlined" color="neutral" startDecorator={<RestoreRoundedIcon/>} onClick={handleRevert}>Revert</Button>
          <IconButton variant='outlined' color="danger" onClick={handleDelete}>
            <DeleteRoundedIcon/>
          </IconButton>
        </Stack>
      </Stack>
      <Textarea variant='soft' minRows={2} value={draft} onChange={handleText} sx={{ fontFamily: "monospace" }} size='sm' />
      { draft_error && <MalformedError error={draft_error}/> }
    </Stack>
  );
}

/** ------------------------------------------------------------------------- */

export default React.memo(AdvancedTransformerEdit);