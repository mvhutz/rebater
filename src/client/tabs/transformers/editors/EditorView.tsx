import React from 'react';
import { CreateTransformerPageInfo, UpdateTransformerPageInfo } from '../../../store/slices/drafts';
import { Divider, Stack } from '@mui/material';
import EditorBar from './EditorBar';
import SimpleEditor from './SimpleEditor';
import AdvancedEditor from './AdvancedEditor';

/** ------------------------------------------------------------------------- */

interface EditorViewProps {
  info: CreateTransformerPageInfo | UpdateTransformerPageInfo;
}

export function EditorView(props: EditorViewProps) {
  const { info } = props;

  let editor;

  switch (info.draft.type) {
    case 'simple':
      editor = <SimpleEditor data={info.draft} />;
      break;
    case 'advanced':
      editor = <AdvancedEditor data={info.draft} />;
      break;
  }

  return (
    <Stack direction="column" flex={1} alignItems="stretch" position="relative">
      <EditorBar info={info} />
      <Divider />
      {editor}
    </Stack>
  );
}

/** ------------------------------------------------------------------------- */

export default React.memo(EditorView);
