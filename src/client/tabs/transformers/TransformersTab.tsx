import React from 'react';
import Stack from '@mui/joy/Stack';
import Typography from '@mui/joy/Typography';
import { useAppSelector } from '../../store/hooks';
import TabMenu from '../../view/TabMenu';
import { getDisplayTab } from '../../store/slices/ui';
import Select from '@mui/joy/Select';
import Option from '@mui/joy/Option';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import { getTransformers } from '../../store/slices/system';
import { MalformedTransformerFileInfo, TransformerFileInfo } from '../../../system/transformer/AdvancedTransformer';
import path from 'path-browserify';
import RestoreRoundedIcon from '@mui/icons-material/RestoreRounded';
import FlashOffIcon from '@mui/icons-material/FlashOffRounded';
import { Alert, Textarea, Button, IconButton } from '@mui/joy';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';

/** ------------------------------------------------------------------------- */

interface MalformedTransformerEditProps {
  info: MalformedTransformerFileInfo;
}

function MalformedTransformerEdit(props: MalformedTransformerEditProps) {
  const { info } = props;
  const [text, setText] = React.useState(info.text);

  const handleText = React.useCallback<React.ChangeEventHandler<HTMLTextAreaElement>>((e) => {
    setText(e.target.value);
  }, []);

  return (
    <Stack padding={2} width={1} boxSizing="border-box" spacing={2}>
      <Stack direction="row" justifyContent="space-between">
        <Typography level="h3">Configuration</Typography>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" color="neutral" startDecorator={<SaveRoundedIcon/>}>Save</Button>
          <Button variant="outlined" color="neutral" startDecorator={<RestoreRoundedIcon/>}>Revert</Button>
          <IconButton variant='outlined' color="danger">
            <DeleteRoundedIcon/>
          </IconButton>
        </Stack>
      </Stack>
      <Textarea variant='soft' minRows={2} value={text} onChange={handleText} sx={{ fontFamily: "monospace" }} size='sm' />
    </Stack>
  );
}

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
  const currentTransformerItem = currentGroupItems != null && currentTransformer != null ? currentGroupItems[currentTransformer] : null;

  let editor;

  if (currentTransformerItem == null) {
    editor = (
      <Stack sx={{ position: "absolute", bottom: 1 }} padding={2} width={1} boxSizing="border-box">
        <Alert startDecorator={<FlashOffIcon sx={{ fontSize: 25 }} color="action" />} variant="soft">
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
  } else {
    editor = "WIP...";
  }

  return (
    <Stack padding={0} display={display} height={1} boxSizing="border-box" position="relative">
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
      {editor}
    </Stack>
  );
}

/** ------------------------------------------------------------------------- */

export default React.memo(TransformersTab);