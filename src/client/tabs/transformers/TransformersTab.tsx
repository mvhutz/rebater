import React from 'react';
import Stack from '@mui/joy/Stack';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { getCurrentTransformer, getDisplayTab, setCurrentTransformer } from '../../store/slices/ui';
import { getTransformerGroups, getTransformers } from '../../store/slices/system';
import { Divider } from '@mui/joy';
import SimpleTransformerEdit from './editors/SimpleTransformerEdit';
import { TransformerFile } from '../../../shared/state/stores/TransformerStore';
import NewTransformerModal from './picker/NewTransformerModal';
import TransformerPicker from './picker/TransformerPicker';
import EmptyEditor from './editors/EmptyEditor';
import AdvancedEditor from './editors/AdvancedEditor';

/** ------------------------------------------------------------------------- */

function TransformersTab() {
  const display = useAppSelector(getDisplayTab("transformers"));
  const groups = useAppSelector(getTransformerGroups);
  const dispatch = useAppDispatch();
  const transformers_reply = useAppSelector(getTransformers);
  const current_transformer = useAppSelector(getCurrentTransformer);

  const transformer_file = React.useMemo(() => {
    if (!transformers_reply.ok) return null;

    return transformers_reply.data.find(t => t.item.name === current_transformer);
  }, [current_transformer, transformers_reply]);

  const handleTransformer = React.useCallback((file: TransformerFile) => {
    dispatch(setCurrentTransformer(file.item.name));
  }, [dispatch]);

  let editor;

  if (transformer_file == null) {
    editor = <EmptyEditor/>;
  } else if (!transformer_file.data.ok) {
    // WIP.
  } else if (transformer_file.data.data.type === "advanced") {
    editor = <AdvancedEditor item={transformer_file.item} data={transformer_file.data.data} />;
  } else if (transformer_file.data.data.type === "simple") {
    editor = <SimpleTransformerEdit item={transformer_file.item} data={transformer_file.data.data} />;
  } else {
    editor = "WIP...";
  }

  if (!groups.ok) return null;

  return (
    <Stack display={display} flex={1} direction="row" padding={0} boxSizing="border-box" alignItems="stretch">
      <TransformerPicker />
      <Divider orientation='vertical' />
      {editor}
      <NewTransformerModal onTransformer={handleTransformer} />
    </Stack>
  );
}

/** ------------------------------------------------------------------------- */

export default React.memo(TransformersTab);