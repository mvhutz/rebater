import React from 'react';
import Stack from '@mui/joy/Stack';
import { useAppSelector } from '../../store/hooks';
import { getDisplayTab } from '../../store/slices/ui';
import { getTransformerPageInfo } from '../../store/slices/system';
import { Divider } from '@mui/joy';
import NewTransformerModal from './picker/NewTransformerModal';
import TransformerPicker from './picker/TransformerPicker';
import EmptyEditor from './editors/EmptyEditor';
import EditorView from './editors/EditorView';

/** ------------------------------------------------------------------------- */

function TransformersTab() {
  const display = useAppSelector(getDisplayTab("transformers"));
  const transformer_page = useAppSelector(getTransformerPageInfo);

  let editor;

  switch (transformer_page.type) {
    case 'create':
    case 'update':
      editor = <EditorView info={transformer_page}/>;
      break;
    case 'empty':
      editor = <EmptyEditor/>;
      break;
  }

  return (
    <Stack display={display} flex={1} direction="row" padding={0} boxSizing="border-box" alignItems="stretch">
      <TransformerPicker />
      <Divider orientation='vertical' />
      {editor}
      <NewTransformerModal />
    </Stack>
  );
}

/** ------------------------------------------------------------------------- */

export default React.memo(TransformersTab);