import Accordion from '@mui/joy/Accordion';
import AccordionSummary from '@mui/joy/AccordionSummary';
import FlashOnRounded from '@mui/icons-material/FlashOnRounded';
import ListItemContent from '@mui/joy/ListItemContent';
import Typography from '@mui/joy/Typography';
import AccordionDetails from '@mui/joy/AccordionDetails';
import React from 'react';
import { useAppDispatch, useAppSelector } from '../../../client/store/hooks';
import { getTransformers, getTransformersSettings, setTransformersNames, setTransformersTags } from '../../../client/store/slices/system';
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
  const { names, tags } = useAppSelector(getTransformersSettings);
  const dispatch = useAppDispatch();

  const handleIncludeNames = React.useCallback((_: unknown, selected: string[]) => {
    dispatch(setTransformersNames(selected));
  }, [dispatch]);

  const handleIncludeTags = React.useCallback((_: unknown, selected: string[]) => {
    dispatch(setTransformersTags(selected));
  }, [dispatch]);

  let chip = null;
  let inner = null;

  if (transformers_reply.ok) {
    const { data: transformers } = transformers_reply;
    const all_tags = new Set(transformers.map(t => t.tags).flat());
    chip = <Chip variant="outlined" color="neutral">{transformers.length}</Chip>

    inner = (
      <Stack spacing={2} pt={1}>
        <FormControl>
          <FormLabel>Select Transformers</FormLabel>
          <Select
            multiple
            value={names.include ?? []}
            onChange={handleIncludeNames}
            placeholder={<Typography color="neutral">All Selected</Typography>}
            renderValue={(selected) => `${selected.length} Selected`}
          >
            {transformers.map(t => (
              <Option value={t.name} key={t.name}>{t.name}</Option>
            ))}
          </Select>
        </FormControl>
        <FormControl>
          <FormLabel>Required Tags</FormLabel>
          <Select
            multiple
            value={tags.include ?? []}
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
    );
  }

  return (
    <Accordion>
      <AccordionSummary variant="soft">
        <FlashOnRounded />
        <ListItemContent>
          <Typography level="title-lg">Transformers</Typography>
        </ListItemContent>
        {chip}
      </AccordionSummary>
      <AccordionDetails>
        {inner}
      </AccordionDetails>
    </Accordion>
  );
}

/** ------------------------------------------------------------------------- */

export default React.memo(TransformerSettings);
