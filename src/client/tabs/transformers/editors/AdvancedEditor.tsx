import React from 'react';
import Stack from '@mui/joy/Stack';
import { Textarea, Sheet } from '@mui/joy';
import { AdvancedTransformerDraft } from '../../../store/slices/drafts';
import { useAppDispatch } from '../../../store/hooks';
import { updateTransformerDraft } from '../../../store/slices/system';
import { produce } from 'immer';

/** ------------------------------------------------------------------------- */

interface AdvancedTransformerEditProps {
  data: AdvancedTransformerDraft
}

function AdvancedEditor(props: AdvancedTransformerEditProps) {
  const { data } = props;
  const dispatch = useAppDispatch();

  const handleText = React.useCallback<React.ChangeEventHandler<HTMLTextAreaElement>>((e) => {
    const updater = produce<AdvancedTransformerDraft>(p => {
      p.text = e.target.value;
    })(data);

    dispatch(updateTransformerDraft(updater));
  }, [data, dispatch]);

  return (
    <Stack flex={1} position="relative">
      <Sheet sx={{ overflow: "auto", flex: "1 1 0px", pb: 32 }}>
        <Textarea variant='plain' value={data.text} onChange={handleText} sx={{
          fontFamily: "monospace",
          "--Textarea-focusedHighlight": "transparent !important",
          padding: 2
        }} size='sm' />
      </Sheet>
    </Stack>
  );
}

/** ------------------------------------------------------------------------- */

export default React.memo(AdvancedEditor);