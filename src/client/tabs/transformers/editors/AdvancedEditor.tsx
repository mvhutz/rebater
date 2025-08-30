import React from 'react';
import Stack from '@mui/joy/Stack';
import Typography from '@mui/joy/Typography';
import { Textarea, Button, IconButton, Divider, Sheet, Input, Autocomplete, Tooltip } from '@mui/joy';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { pullTransformers } from '../../../store/slices/thunk';
import { TransformerFile } from '../../../../shared/state/stores/TransformerStore';
import { AdvancedTransformerData, AdvancedTransformerSchema } from '../../../../shared/transformer/advanced';
import FlashOnRoundedIcon from '@mui/icons-material/FlashOnRounded';
import { bad, good } from '../../../../shared/reply';
import MalformedError from '../MalformedError';
import FolderIcon from '@mui/icons-material/Folder';
import z from 'zod/v4';
import { getTransformerGroups } from '../../../store/slices/system';

/** ------------------------------------------------------------------------- */

const { invoke } = window.api;

interface AdvancedTransformerEditProps {
  item: TransformerFile["item"];
  data: AdvancedTransformerData
}

function AdvancedEditor(props: AdvancedTransformerEditProps) {
  const { item, data } = props;
  const [draft, setDraft] = React.useState(JSON.stringify(data, null, 2));
  const groups_reply = useAppSelector(getTransformerGroups);
  const dispatch = useAppDispatch();

  const groups = groups_reply.ok ? Object.keys(groups_reply.data) : [];

  const { success: transformer_ready, data: draft_transformer, error: draft_error } = React.useMemo(() => {
    try {
      const parsed = AdvancedTransformerSchema.safeParse(JSON.parse(draft));
      return { ...parsed, error: parsed.error && z.prettifyError(parsed.error) }
    } catch (err) {
      return { success: false, data: undefined, error: `${err}` };
    }
  }, [draft]);

  React.useEffect(() => {
    setDraft(JSON.stringify(data, null, 2));
  }, [data]);

  const handleText = React.useCallback<React.ChangeEventHandler<HTMLTextAreaElement>>((e) => {
    setDraft(e.target.value);
  }, []);

  const handleRevert = React.useCallback(() => {
    setDraft(JSON.stringify(data, null, 2));
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
    <Stack direction="column" flex={1} alignItems="stretch">
      <Stack direction="row" alignItems="center" p={1}>
        <Stack direction="row" justifyContent="stretch" spacing={1} flex={0} flexShrink={1}>
          <Tooltip title="Source Group">
            <Typography level="body-sm" variant="soft" color="primary" sx={{ fontFamily: "monospace", borderRadius: 100, px: 2, py: 0.5 }}>
              Advanced
            </Typography>
          </Tooltip>
          <Typography>/</Typography>
          <Tooltip title="Transformer Name">
            <Typography level="body-sm" variant="solid" color="primary" sx={{ fontWeight: "bold", whiteSpace: "pre", fontFamily: "monospace", borderRadius: 100, px: 2, py: 0.5 }} startDecorator={<FlashOnRoundedIcon fontSize='small' />}>
              {data.name}
            </Typography>
          </Tooltip>
        </Stack>
        <Stack direction="row" spacing={1} flex={1} justifyContent="end">
          <Button size="sm" disabled={!transformer_ready} variant="soft" color="neutral" onClick={handleSave}>Save</Button>
          <Button size="sm" variant="soft" color="neutral" onClick={handleRevert}>Revert</Button>
          <IconButton size="sm" variant='soft' color="danger" onClick={handleDelete}>
            <DeleteRoundedIcon />
          </IconButton>
        </Stack>
      </Stack>
      <Divider />
      <Stack flex={1} position="relative">
        <Sheet sx={{ overflow: "auto", flex: "1 1 0px" }}>
          <Textarea variant='plain' value={draft} onChange={handleText} sx={{
            fontFamily: "monospace",
            "--Textarea-focusedHighlight": "transparent !important",
            padding: 2
          }} size='sm' />
        </Sheet>
        {draft_error && <MalformedError error={draft_error} />}
      </Stack>
    </Stack>
  );
}

/** ------------------------------------------------------------------------- */

export default React.memo(AdvancedEditor);