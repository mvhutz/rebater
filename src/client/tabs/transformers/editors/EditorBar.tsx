import React from 'react';
import Stack from '@mui/joy/Stack';
import Typography from '@mui/joy/Typography';
import { Button, IconButton, Tooltip } from '@mui/joy';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';

/** ------------------------------------------------------------------------- */

interface EditorBarProps {
  group: string;
  name: string;
  disable_save?: boolean;
  onSave: () => void;
  onRevert: () => void;
  onDelete: () => void;
}

function EditorBar(props: EditorBarProps) {
  const { group, name, disable_save, onSave, onRevert, onDelete } = props;

  return (
    <Stack direction="row" alignItems="center" p={1}>
        <Stack direction="row" alignItems="center" justifyContent="center" spacing={0.25} flex={0} flexShrink={1}>
          <Tooltip title="Source Group">
            <Typography level="body-sm" variant="soft" color="primary" sx={{ fontWeight: "bold", px: 1, fontFamily: "monospace" }}>
              {group}
            </Typography>
          </Tooltip>
          <ChevronRightRoundedIcon fontSize='small'/>
          <Tooltip title="Transformer Name">
            <Typography level="body-sm" variant="soft" color="primary" sx={{ fontWeight: "bold", px: 1, whiteSpace: "pre", fontFamily: "monospace" }}>
              {name}
            </Typography>
          </Tooltip>
        </Stack>
        <Stack direction="row" spacing={1} flex={1} justifyContent="end">
          <Button size="sm" disabled={disable_save} variant="soft" color="neutral" onClick={onSave}>Save</Button>
          <Button size="sm" variant="soft" color="neutral" onClick={onRevert}>Revert</Button>
          <Tooltip title="Discard Transformer">
            <IconButton size="sm" variant='plain' color="neutral" onClick={onDelete}>
              <DeleteRoundedIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>
  )
}

/** ------------------------------------------------------------------------- */

export default React.memo(EditorBar);
