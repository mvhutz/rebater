import React from 'react';
import Stack from '@mui/joy/Stack';
import { Textarea, Divider, Sheet } from '@mui/joy';
import { useAppDispatch } from '../../../store/hooks';
import { pullTransformers } from '../../../store/slices/thunk';
import { TransformerFile } from '../../../../shared/state/stores/TransformerStore';
import { AdvancedTransformerData, AdvancedTransformerSchema } from '../../../../shared/transformer/advanced';
import { bad, good } from '../../../../shared/reply';
import MalformedError from '../MalformedError';
import z from 'zod/v4';
import EditorBar from './EditorBar';

/** ------------------------------------------------------------------------- */

const { invoke } = window.api;

interface AdvancedTransformerEditProps {
  item: TransformerFile["item"];
  data: AdvancedTransformerData
}

function AdvancedEditor(props: AdvancedTransformerEditProps) {
  const { item, data } = props;
  const [draft, setDraft] = React.useState(JSON.stringify(data, null, 2));
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
      <EditorBar group="Advanced" name={data.name} disable_save={!transformer_ready} onSave={handleSave} onRevert={handleRevert} onDelete={handleDelete} />
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