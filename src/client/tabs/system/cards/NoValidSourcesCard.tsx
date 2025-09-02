import React from 'react';
import { useAppSelector } from '../../../store/hooks';
import { getRunResults } from '../../../store/slices/system';
import AnalysisAccordion from '../AnalysisAccordion';
import FolderOffRoundedIcon from '@mui/icons-material/FolderOffRounded';
import { List, ListItem, Typography } from '@mui/joy';

/** ------------------------------------------------------------------------- */

function NoValidSourcesCard() {
  const results = useAppSelector(getRunResults);
  if (results == null) return;

  const { issues: { no_valid_source } } = results
  return (
    <AnalysisAccordion
      disabled={no_valid_source.length === 0}
      amount={no_valid_source.length}
      color="danger"
      title="Transformers With No Valid Sources"
      subtitle="These transformers were run, but found no valid source files. Maybe look at its configuration? It might need to be updated."
      icon={<FolderOffRoundedIcon />}>
      <List marker="disc">
        {no_valid_source.map(i => (
          <ListItem>
            <Typography>
              <code>{i.transformer}</code>
            </Typography>
          </ListItem>
        ))}
      </List>
    </AnalysisAccordion>
  );
}

/** ------------------------------------------------------------------------- */

export default React.memo(NoValidSourcesCard);
