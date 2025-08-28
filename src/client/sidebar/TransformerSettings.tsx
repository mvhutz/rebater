import Accordion from '@mui/joy/Accordion';
import AccordionSummary from '@mui/joy/AccordionSummary';
import FlashOnRounded from '@mui/icons-material/FlashOnRounded';
import ListItemContent from '@mui/joy/ListItemContent';
import Typography from '@mui/joy/Typography';
import AccordionDetails from '@mui/joy/AccordionDetails';
import React from 'react';
import { useAppDispatch, useAppSelector } from '../../client/store/hooks';
import { getDraftTransformersSettings, getTransformers, setDraftTransformersNames, setDraftTransformersTags } from '../../client/store/slices/system';
import Chip from '@mui/joy/Chip';
import FormControl from '@mui/joy/FormControl';
import Option from '@mui/joy/Option';
import Select from '@mui/joy/Select';
import Stack from '@mui/joy/Stack';
import FormLabel from '@mui/joy/FormLabel';
import Box from '@mui/joy/Box';

/** ------------------------------------------------------------------------- */

function TransformerSettings() {
  const transformers_reply = useAppSelector(getTransformers);
  const {
    names: { include: selected_names = [] },
    tags: { include: selected_tags = [] }
  } = useAppSelector(getDraftTransformersSettings);
  const dispatch = useAppDispatch();

  const handleIncludeNames = React.useCallback((_: unknown, selected: string[]) => {
    dispatch(setDraftTransformersNames(selected));
  }, [dispatch]);

  const handleIncludeTags = React.useCallback((_: unknown, selected: string[]) => {
    dispatch(setDraftTransformersTags(selected));
  }, [dispatch]);

  const all_tags = React.useMemo(() => {
    if (!transformers_reply.ok) return [];
    const { data: transformers } = transformers_reply;
    const tags = transformers
      .map(t => t.type === "advanced" ? t.tags : [t.group])
      .flat();

    return new Set(tags);
  }, [transformers_reply]);

  return (
    <Accordion>
      <AccordionSummary variant="soft">
        <FlashOnRounded />
        <ListItemContent>
          <Typography level="title-lg">Transformers</Typography>
        </ListItemContent>
        <Chip variant="outlined" color="neutral">
          {transformers_reply.ok ? transformers_reply.data.length : "..."}
        </Chip>
      </AccordionSummary>
      <AccordionDetails>
        <Stack spacing={2} pt={1}>
          <FormControl>
            <FormLabel>Select Transformers</FormLabel>
            <Select
              multiple
              value={selected_names}
              onChange={handleIncludeNames}
              disabled={!transformers_reply.ok}
              placeholder={<Typography color="neutral">All Selected</Typography>}
              renderValue={(selected) => `${selected.length} Selected`}
            >
              {transformers_reply.ok &&
                transformers_reply.data.map(t => (
                  <Option value={t.name} key={t.name}>{t.name}</Option>
                ))
              }
            </Select>
          </FormControl>
          <FormControl>
            <FormLabel>Required Tags</FormLabel>
            <Select
              multiple
              value={selected_tags}
              onChange={handleIncludeTags}
              renderValue={selected => (
                <Box sx={{ display: 'flex', gap: '0.25rem', m: 0 }}>
                  {selected.map((selectedOption) => (
                    <Chip variant="soft" color="primary" key={selectedOption.id}>
                      {selectedOption.label}
                    </Chip>
                  ))}
                </Box>
              )}
              placeholder={<Typography color="neutral">None Required</Typography>}
            >
              {[...all_tags].map(t => (
                <Option value={t} key={t}>{t}</Option>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
}

/** ------------------------------------------------------------------------- */

export default React.memo(TransformerSettings);
