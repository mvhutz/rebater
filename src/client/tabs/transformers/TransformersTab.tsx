import React from 'react';
import Stack from '@mui/joy/Stack';
import Typography from '@mui/joy/Typography';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import TabMenu from '../../view/TabMenu';
import { getDisplayTab, toggleNewTransformerModal } from '../../store/slices/ui';
import Select from '@mui/joy/Select';
import Option from '@mui/joy/Option';
import { getTransformers } from '../../store/slices/system';
import FlashOffIcon from '@mui/icons-material/FlashOffRounded';
import { Alert, Button, Card } from '@mui/joy';
import AdvancedTransformerEdit from './AdvancedTransformerEdit';
import AddRounded from '@mui/icons-material/AddRounded';
import NewTransformerModal from './NewTransformerModal';
import SimpleTransformerEdit from './SimpleTransformerEdit';
import { TransformerFile } from '../../../shared/state/stores/TransformerStore';
import { AdvancedTransformerData } from '../../../shared/transformer/advanced';
import { good, GoodReply } from '../../../shared/reply';
import { SimpleTransformerData } from '../../../shared/transformer/simple';

/** ------------------------------------------------------------------------- */

function TransformersTab() {
  const display = useAppSelector(getDisplayTab("transformers"));
  const transformers_reply = useAppSelector(getTransformers);
  const dispatch = useAppDispatch();
  const [currentGroup, setCurrentGroup] = React.useState<Maybe<string>>(null);
  const [currentTransformer, setCurrentTransformer] = React.useState<Maybe<string>>(null);

  const groups = React.useMemo(() => {
    const result: Record<string, TransformerFile[]> = {};
    if (!transformers_reply.ok) return transformers_reply;

    for (const transformer of transformers_reply.data) {
      if (!transformer.data.ok) continue;
      switch (transformer.data.data.type) {
        case "advanced":
          result["Advanced"] ??= [];
          result["Advanced"].push(transformer);
          break;
        case "simple":
          result[transformer.data.data.group] ??= [];
          result[transformer.data.data.group].push(transformer);
      }
    }
    return good(result);
  }, [transformers_reply]);

  const { currentGroupItems, currentTransformerItem } = React.useMemo(() => {
    if (!groups.ok) return { currentGroupItems: null, currentTransformerItem: null };

    const currentGroupItems = currentGroup != null ? groups.data[currentGroup] : null;
    const currentTransformerItem = currentGroupItems != null ? currentGroupItems.find(t => t.item.name === currentTransformer) : null;
    return { currentGroupItems, currentTransformerItem };
  }, [currentGroup, currentTransformer, groups]);

  const searchGroups = React.useCallback((filepath: Maybe<string>) => {
    if (!groups.ok) return;

    for (const [groupName, items] of Object.entries(groups.data)) {
      if (items.find(t => t.item.name === filepath) != null) {
        setCurrentGroup(groupName);
        setCurrentTransformer(filepath);
        return;
      }
    }
  }, [groups]);

  React.useLayoutEffect(() => {
    searchGroups(currentTransformer);
  }, [currentTransformer, searchGroups]);

  const handleTransformer = React.useCallback((file: TransformerFile) => {
    setCurrentTransformer(file.item.name);
    searchGroups(file.item.name);
  }, [searchGroups]);

  const handleCurrentGroup = React.useCallback((_: unknown, value: Maybe<string>) => {
    setCurrentGroup(value);
    setCurrentTransformer(null);
  }, []);

  const handleCurrentTransformer = React.useCallback((_: unknown, value: Maybe<string>) => {
    if (value == null) return;
    setCurrentTransformer(value);
  }, []);

  const handleNewTransformer = React.useCallback(() => {
    dispatch(toggleNewTransformerModal());
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
        data={currentTransformerItem.data as GoodReply<AdvancedTransformerData>}/>
    );
  } else if (currentTransformerItem.data.data.type === "simple") {
    editor = (
      <SimpleTransformerEdit
        item={currentTransformerItem.item}
        data={currentTransformerItem.data as GoodReply<SimpleTransformerData>}/>
    );
  } else {
    editor = "WIP...";
  }

  return (
    <Stack padding={0} display={display} height={1} boxSizing="border-box" position="relative">
      <TabMenu>
        <Card variant="outlined" orientation="horizontal"  sx={{ p: 0, gap: 1, alignItems: "center" }}>
        <Typography level="body-sm" color="neutral" pl={1}>
          From
        </Typography>
        <Select disabled={!groups.ok} size="sm" placeholder="Group?" variant="soft" value={currentGroup} onChange={handleCurrentGroup}>
          {Object.keys(groups.ok ? groups.data : {}).map(g => (
            <Option value={g} key={g}>{g}</Option>
          ))}
        </Select>
        <Typography level="body-sm" color="neutral">
          edit
        </Typography>
        <Select size="sm" placeholder="Transformer?" variant="soft" value={currentTransformer} onChange={handleCurrentTransformer} disabled={currentGroupItems == null}>
          {currentGroupItems?.map((g) => (g.data.ok &&
            <Option value={g.item.name} key={g.item.name}>{g.data.data.name}</Option>
          ))}
        </Select>
        </Card>
        <Button size='sm' variant="outlined" color="primary" startDecorator={<AddRounded/>} onClick={handleNewTransformer}>
          New
        </Button>
      </TabMenu>
      {editor}
      <NewTransformerModal onTransformer={handleTransformer}/>
    </Stack>
  );
}

/** ------------------------------------------------------------------------- */

export default React.memo(TransformersTab);