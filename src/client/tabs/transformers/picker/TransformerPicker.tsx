import React from 'react';
import Typography from '@mui/joy/Typography';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { toggleNewTransformerModal } from '../../../store/slices/ui';
import { getCurrentTransformerId, getTransformerGroups } from '../../../store/slices/system';
import { Accordion, AccordionDetails, AccordionGroup, AccordionSummary, Button, IconButton, List, ListItem, ListItemButton, ListItemContent, Sheet, Stack, Tooltip } from '@mui/joy';
import { ErrorOutlineRounded, RestoreRounded } from '@mui/icons-material';
import { TransformerFile } from '../../../../shared/state/stores/TransformerStore';
import { pullTransformers, viewExistingTransformer } from '../../../store/slices/thunk';

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
  const transformer_id = useAppSelector(getCurrentTransformerId);
  const dispatch = useAppDispatch();

  const handleNewTransformer = React.useCallback(() => {
    dispatch(toggleNewTransformerModal());
  }, [dispatch]);

  const handleRefresh = React.useCallback(() => {
    dispatch(pullTransformers());
  }, [dispatch]);

  const handleExistingTransformer = React.useCallback((file: TransformerFile) => {
    dispatch(viewExistingTransformer(file.item.name));
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
      <AccordionGroup size='sm' disableDivider>
        {Object.entries(groups).map(([group, files]) => <React.Fragment key={group}>
          <Accordion>
            <AccordionSummary>
              <Typography sx={{ fontVariant: "all-petite-caps" }} level="title-sm">{group} ({files.length})</Typography>
              </AccordionSummary>
            <AccordionDetails>
              {files.map(file => (
                <List sx={{ '--ListItem-paddingLeft': '2rem' }} key={file.item.name}>
                  <ListItem>
                    <Tooltip title={getTransformerName(file)} placement="right">
                      <ListItemButton selected={transformer_id === file.item.name} key={file.item.name} onClick={() => handleExistingTransformer(file)}>
                        <ListItemContent>
                          <Typography noWrap fontFamily="monospace" fontSize="small">{getTransformerName(file)}</Typography>
                        </ListItemContent>
                      </ListItemButton>
                    </Tooltip>
                  </ListItem>
                </List>
              ))}
            </AccordionDetails>
          </Accordion>
        </React.Fragment>)}
      </AccordionGroup>
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
          <Button size="sm" fullWidth color="neutral" variant='outlined' onClick={handleNewTransformer}>
            New Transformer
          </Button>
          <Tooltip title="Refresh Transformers">
            <IconButton size="sm" variant='outlined' onClick={handleRefresh}>
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