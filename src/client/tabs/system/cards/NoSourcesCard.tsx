import React from 'react';
import { useAppSelector } from '../../../store/hooks';
import { getRunResults } from '../../../store/slices/system';
import AnalysisAccordion from '../AnalysisAccordion';
import FolderOffRoundedIcon from '@mui/icons-material/FolderOffRounded';
import { List, ListItem, Typography } from '@mui/joy';

/** ------------------------------------------------------------------------- */

function NoSourcesCard() {
  const results = useAppSelector(getRunResults);
  if (results == null) return;

  const { issues: { no_source } } = results
  return (
    <AnalysisAccordion
      disabled={no_source.length === 0}
      amount={no_source.length}
      color="danger"
      title="Transformers With No Sources"
      subtitle="These transformers were run, but no valid source files were found. Maybe look at its configuration? It might need to be updated."
      icon={<FolderOffRoundedIcon />}>
      <List marker="disc">
        {no_source.map(i => (
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

export default React.memo(NoSourcesCard);
