import React from 'react';
import Stack from '@mui/joy/Stack';
import Typography from '@mui/joy/Typography';
import { useAppSelector } from '../../store/hooks';
import TabMenu from '../../view/TabMenu';
import { getDisplayTab } from '../../store/slices/ui';
import Select from '@mui/joy/Select';
import Option from '@mui/joy/Option';
import { getTransformers } from '../../store/slices/system';
import { TransformerFileInfo } from '../../../system/transformer/AdvancedTransformer';
import path from 'path-browserify';

/** ------------------------------------------------------------------------- */

function TransformersTab() {
  const display = useAppSelector(getDisplayTab("transformers"));
  const transformers = useAppSelector(getTransformers);
  const [currentGroup, setCurrentGroup] = React.useState<Maybe<string>>();
  const [currentTransformer, setCurrentTransformer] = React.useState<Maybe<number>>();

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

  const handleCurrentGroup = React.useCallback((_: unknown, value: Maybe<string>) => {
    setCurrentGroup(value);
    setCurrentTransformer(null);
  }, []);

  const handleCurrentTransformer = React.useCallback((_: unknown, value: Maybe<number>) => {
    setCurrentTransformer(value);
  }, []);

  const currentGroupItems = currentGroup != null ? groups[currentGroup] : null;

  return (
    <Stack padding={0} display={display}>
      <TabMenu>
        <Typography level="body-lg" pt={0.5} color="neutral">
          <i>From</i>
        </Typography>
        <Select size="sm" placeholder="Group..." variant="soft" value={currentGroup} onChange={handleCurrentGroup}>
          {Object.keys(groups).map(g => (
            <Option value={g} key={g}>{g}</Option>
          ))}
        </Select>
        <Typography level="body-lg" pt={0.5} color="neutral">
          <i>editing</i>
        </Typography>
        <Select size="sm" placeholder="Transformer..." variant="soft" value={currentTransformer} onChange={handleCurrentTransformer}>
          {currentGroupItems?.map((g, i) => (
            <Option value={i} key={i}>{g.type !== "malformed" ? g.data.name : path.basename(g.path)}</Option>
          ))}
        </Select>
      </TabMenu>
      <Stack padding={2} spacing={2}>
        WIP...
      </Stack>
    </Stack>
  );
}

/** ------------------------------------------------------------------------- */

export default React.memo(TransformersTab);