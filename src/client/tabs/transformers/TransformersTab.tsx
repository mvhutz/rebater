import React from 'react';
import Stack from '@mui/joy/Stack';
import Typography from '@mui/joy/Typography';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { getCurrentTransformer, getDisplayTab, setCurrentTransformer } from '../../store/slices/ui';
import { getTransformerGroups, getTransformers } from '../../store/slices/system';
import FlashOffIcon from '@mui/icons-material/FlashOffRounded';
import { Alert, Divider } from '@mui/joy';
import SimpleTransformerEdit from './editors/SimpleTransformerEdit';
import { TransformerFile } from '../../../shared/state/stores/TransformerStore';
import { AdvancedTransformerData } from '../../../shared/transformer/advanced';
import { type GoodReply } from '../../../shared/reply';
import { SimpleTransformerData } from '../../../shared/transformer/simple';
import AdvancedTransformerEdit from './editors/AdvancedTransformerEdit';
import NewTransformerModal from './picker/NewTransformerModal';
import TransformerPicker from './picker/TransformerPicker';

/** ------------------------------------------------------------------------- */

function TransformersTab() {
  const display = useAppSelector(getDisplayTab("transformers"));
  const groups = useAppSelector(getTransformerGroups);
  const dispatch = useAppDispatch();
  const transformers_reply = useAppSelector(getTransformers);
  const current_transformer = useAppSelector(getCurrentTransformer);

  const currentTransformerItem = React.useMemo(() => {
    if (!transformers_reply.ok) return null;

    return transformers_reply.data.find(t => t.item.name === current_transformer);
  }, [current_transformer, transformers_reply]);

  const handleTransformer = React.useCallback((file: TransformerFile) => {
    dispatch(setCurrentTransformer(file.item.name));
  }, [dispatch]);

  let editor;

  if (currentTransformerItem == null) {
    editor = (
      <Stack sx={{ position: "absolute", bottom: 1 }} padding={2} width={1} boxSizing="border-box">
        <Alert startDecorator={<FlashOffIcon sx={{ fontSize: 25 }} color="action" />} variant="soft" sx={{ alignItems: 'flex-start' }}>
          <div>
            <div>No transformer selected!</div>
            <Typography level="body-sm" fontWeight="400" color="neutral">
              Use the picker above to edit a specific configuration.
            </Typography>
          </div>
        </Alert>
      </Stack>
    );
  } else if (!currentTransformerItem.data.ok) {
    // WIP.
  } else if (currentTransformerItem.data.data.type === "advanced") {
    editor = (
      <AdvancedTransformerEdit
        item={currentTransformerItem.item}
        data={currentTransformerItem.data as GoodReply<AdvancedTransformerData>} />
    );
  } else if (currentTransformerItem.data.data.type === "simple") {
    editor = (
      <SimpleTransformerEdit
        item={currentTransformerItem.item}
        data={currentTransformerItem.data as GoodReply<SimpleTransformerData>} />
    );
  } else {
    editor = "WIP...";
  }

  if (!groups.ok) return null;

  return (
    <Stack display={display} height={1} overflow="hidden">
      <Stack direction="row" padding={0} height={1} overflow="hidden" boxSizing="border-box">
        <TransformerPicker />
        <Divider orientation='vertical' />
        <Stack position="relative" flex={1}>
          {editor}
        </Stack>
      </Stack>
      <NewTransformerModal onTransformer={handleTransformer} />
    </Stack>
  );
}

/** ------------------------------------------------------------------------- */

export default React.memo(TransformersTab);