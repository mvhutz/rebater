import React from 'react';
import Stack from '@mui/joy/Stack';
import Typography from '@mui/joy/Typography';
// import QuestionMarkRoundedIcon from '@mui/icons-material/QuestionMarkRounded';
import { useAppSelector } from '../../../../store/hooks';
import TabMenu from '../../TabMenu';
import { getDisplayTab } from '../../../../../client/store/slices/ui';
import { getSystemQuestions } from '../../../../store/slices/system';
import InputModal from './InputModal';

/** ------------------------------------------------------------------------- */

// const { invoke } = window.api;

function QuestionsTab() {
  const display = useAppSelector(getDisplayTab("questions"));
  const questions = useAppSelector(getSystemQuestions);

  return (
    <Stack padding={0} display={display}>
      <TabMenu>
        <Typography level="body-lg" pt={0.5} color="neutral"><i>Questions</i></Typography>
      </TabMenu>
      <Stack padding={2}>
        {Object.entries(questions).map(([hash, q]) => (
          <InputModal key={hash} question={q} />
        ))}
      </Stack>
    </Stack>
  );
}

/** ------------------------------------------------------------------------- */

export default React.memo(QuestionsTab);