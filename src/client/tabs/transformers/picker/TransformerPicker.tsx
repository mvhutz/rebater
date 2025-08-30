import React from 'react';
import Typography from '@mui/joy/Typography';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { getCurrentTransformer, setCurrentTransformer, toggleNewTransformerModal } from '../../../store/slices/ui';
import { getTransformerGroups } from '../../../store/slices/system';
import { Button, IconButton, List, ListItem, ListItemButton, ListItemContent, ListSubheader, Sheet, Stack, Tooltip } from '@mui/joy';
import { ErrorOutlineRounded, RestoreRounded } from '@mui/icons-material';
import { TransformerFile } from '../../../../shared/state/stores/TransformerStore';

/** ------------------------------------------------------------------------- */

function getTransformerName(file: TransformerFile) {
  if (!file.data.ok) {
    return file.item.name;
  } else {
    return file.data.data.name;
  }
}

function TransformerPicker() {
  const transformers_group_reply = useAppSelector(getTransformerGroups);
  const current_transformer = useAppSelector(getCurrentTransformer);
  const dispatch = useAppDispatch();

  const handleNewTransformer = React.useCallback(() => {
    dispatch(toggleNewTransformerModal());
  }, [dispatch]);

  let inner;

  if (!transformers_group_reply.ok) {
    inner = (
      <Stack flex={1} width={1} justifyContent="center" alignItems="center" direction="column" spacing={1} padding={4} boxSizing="border-box">
        <ErrorOutlineRounded color="action" sx={{ fontSize: 70 }} />
        <Typography>{transformers_group_reply.reason}</Typography>
      </Stack>
    );
  } else {
    const { data: groups } = transformers_group_reply;

    inner = (
      <List sx={{ '--List-nestedInsetStart': '2rem' }}>
        {Object.entries(groups).map(([group, files]) => <React.Fragment key={group}>
          <ListItem nested>
            <ListSubheader sticky>{group} ({files.length})</ListSubheader>
            <List size='sm'>
              {files.map(file => (
                <ListItem>
                  <Tooltip title={getTransformerName(file)} placement="right">
                    <ListItemButton selected={current_transformer === file.item.name} key={file.item.name} onClick={() => dispatch(setCurrentTransformer(file.item.name))}>
                      <ListItemContent>
                        <Typography noWrap fontFamily="monospace" fontSize="small">{getTransformerName(file)}</Typography>
                      </ListItemContent>
                    </ListItemButton>
                  </Tooltip>
                </ListItem>
              ))}
            </List>
          </ListItem>
        </React.Fragment>)}
      </List>
    )
  }

  return (
    <Stack width={250} direction="column">
      <Stack flex={1}>
        <Sheet variant="soft" sx={{ overflow: "auto", flex: "1 1 0px" }}>
          {inner}
        </Sheet>
      </Stack>
      <Sheet variant="soft">
        <Stack direction="row" padding={1} spacing={1}>
          <Button size="sm" fullWidth color='primary' variant='solid' onClick={handleNewTransformer}>
            New Transformer
          </Button>
          <Tooltip title="Refresh Transformers">
            <IconButton size="sm" variant='outlined'>
              <RestoreRounded />
            </IconButton>
          </Tooltip>
        </Stack>
      </Sheet>
    </Stack>
  )
}

/** ------------------------------------------------------------------------- */

export default React.memo(TransformerPicker);