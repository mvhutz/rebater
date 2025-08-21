import React from 'react';
import Stack from '@mui/joy/Stack';
import Typography from '@mui/joy/Typography';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import TabMenu from '../../view/TabMenu';
import { getDisplayTab, toggleNewTransformerModal } from '../../store/slices/ui';
import Select from '@mui/joy/Select';
import Option from '@mui/joy/Option';
import { getTransformers } from '../../store/slices/system';
import path from 'path-browserify';
import FlashOffIcon from '@mui/icons-material/FlashOffRounded';
import { Alert, Button, Card } from '@mui/joy';
import MalformedTransformerEdit from './MalformedTransformerEdit';
import AdvancedTransformerEdit from './AdvancedTransformerEdit';
import AddRounded from '@mui/icons-material/AddRounded';
import NewTransformerModal from './NewTransformerModal';
import { TransformerFileInfo } from '../../../system/transformer/BaseTransformers';

/** ------------------------------------------------------------------------- */

function TransformersTab() {
  const display = useAppSelector(getDisplayTab("transformers"));
  const transformers = useAppSelector(getTransformers);
  const dispatch = useAppDispatch();
  const [currentGroup, setCurrentGroup] = React.useState<Maybe<string>>(null);
  const [currentTransformer, setCurrentTransformer] = React.useState<Maybe<string>>(null);

  const { groups } = React.useMemo(() => {
    const result = {
      groups: {} as Record<string, TransformerFileInfo[]>
    };

    for (const transformer of transformers) {
      switch (transformer.type) {
        case "advanced":
          result.groups["Advanced"] ??= [];
          result.groups["Advanced"].push(transformer);
          break;
        case "malformed":
          result.groups["Malformed"] ??= [];
          result.groups["Malformed"].push(transformer);
          break;
      }
    }
    return result;
  }, [transformers]);

  const searchGroups = React.useCallback((filepath: Maybe<string>) => {
    for (const [groupName, items] of Object.entries(groups)) {
      if (items.find(t => t.path === filepath) != null) {
        setCurrentGroup(groupName);
        setCurrentTransformer(filepath);
        return;
      }
    }
  }, [groups]);

  React.useLayoutEffect(() => {
    searchGroups(currentTransformer);
  }, [currentTransformer, searchGroups]);

  const handleTransformer = React.useCallback((filepath: string) => {
    setCurrentTransformer(filepath);
    searchGroups(filepath);
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

  const currentGroupItems = currentGroup != null ? groups[currentGroup] : null;
  const currentTransformerItem = currentGroupItems != null ? currentGroupItems.find(t => t.path === currentTransformer) : null;

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
  } else if (currentTransformerItem.type === "malformed") {
    editor = <MalformedTransformerEdit info={currentTransformerItem}/>;
  } else if (currentTransformerItem.type === "advanced") {
    editor = <AdvancedTransformerEdit info={currentTransformerItem}/>;
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
        <Select size="sm" placeholder="Group?" variant="soft" value={currentGroup} onChange={handleCurrentGroup}>
          {Object.keys(groups).map(g => (
            <Option value={g} key={g}>{g}</Option>
          ))}
        </Select>
        <Typography level="body-sm" color="neutral">
          edit
        </Typography>
        <Select size="sm" placeholder="Transformer?" variant="soft" value={currentTransformer} onChange={handleCurrentTransformer} disabled={currentGroupItems == null}>
          {currentGroupItems?.map((g) => (
            <Option value={g.path} key={g.path}>{g.type !== "malformed" ? g.data.name : path.basename(g.path)}</Option>
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