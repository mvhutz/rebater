import React from 'react';
import Stack from '@mui/joy/Stack';
import Typography from '@mui/joy/Typography';
import { Button, IconButton, Tooltip } from '@mui/joy';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import { CreateTransformerPageInfo, UpdateTransformerPageInfo } from '../../../store/slices/drafts';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { deleteTransformerDraft, discardTransformerDraft, saveTransformerDraft } from '../../../store/slices/thunk';
import { getTransformerDraftAsData, getTransformerPageInfo } from '../../../store/slices/system';
import MalformedError from '../MalformedError';

/** ------------------------------------------------------------------------- */

function OptionsBar() {
  const page = useAppSelector(getTransformerPageInfo);
  const dispatch = useAppDispatch();
  const draft = useAppSelector(getTransformerDraftAsData);

  const handleRevert = React.useCallback(async () => {
    await dispatch(discardTransformerDraft());
  }, [dispatch]);

  const handleSave = React.useCallback(async () => {
    await dispatch(saveTransformerDraft());
  }, [dispatch]);

  const handleDelete = React.useCallback(async () => {
    await dispatch(deleteTransformerDraft());
  }, [dispatch]);

  return (
    <Stack direction="row" spacing={1} flex={1} justifyContent="end">
      {page.type === "update" &&
        <Button size="sm" disabled={!draft.ok} variant="soft" color="neutral" onClick={handleSave}>Save</Button>
      }
      {page.type === "create" &&
        <Button size="sm" disabled={!draft.ok} variant="solid" color="primary" onClick={handleSave}>Create</Button>
      }
      {page.type === "update" &&
        <Button size="sm" variant="soft" color="neutral" onClick={handleRevert}>Revert</Button>
      }
      {page.type === "create" &&
        <Button size="sm" variant="plain" color="neutral" onClick={handleRevert}>Discard</Button>
      }
      {page.type === "update" &&
        <Tooltip title="Discard Transformer">
          <IconButton size="sm" variant='plain' color="neutral" onClick={handleDelete}>
            <DeleteRoundedIcon />
          </IconButton>
        </Tooltip>
      }
    </Stack>
  );
}

/** ------------------------------------------------------------------------- */

interface EditorBarProps {
  info: UpdateTransformerPageInfo | CreateTransformerPageInfo;
}

function EditorBar(props: EditorBarProps) {
  const { info: { draft } } = props;
  const data = useAppSelector(getTransformerDraftAsData);

  const name = data.ok ? data.data.name : draft.name ?? "??";
  const group = draft.type === "simple" ? draft.group : "Advanced";

  console.log(data);

  return (
    <Stack direction="row" alignItems="center" p={1}>
      <Stack direction="row" alignItems="center" justifyContent="center" spacing={0.25} flex={0} flexShrink={1}>
        <Tooltip title="Source Group">
          <Typography whiteSpace="pre" level="body-sm" variant="soft" color="primary" sx={{ fontWeight: "bold", px: 1, fontFamily: "monospace" }}>
            {group}
          </Typography>
        </Tooltip>
        <ChevronRightRoundedIcon fontSize='small' />
        <Tooltip title="Transformer Name">
          <Typography whiteSpace="pre" level="body-sm" variant="soft" color="primary" sx={{ fontWeight: "bold", px: 1, whiteSpace: "pre", fontFamily: "monospace" }}>
            {name}
          </Typography>
        </Tooltip>
      </Stack>
      <OptionsBar/>
      {!data.ok && <MalformedError error={data.reason} />}
    </Stack>
  )
}

/** ------------------------------------------------------------------------- */

export default React.memo(EditorBar);
