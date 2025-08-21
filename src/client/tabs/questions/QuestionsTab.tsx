import React from 'react';
import Stack from '@mui/joy/Stack';
import Typography from '@mui/joy/Typography';
// import QuestionMarkRoundedIcon from '@mui/icons-material/QuestionMarkRounded';
import { useAppSelector } from '../../store/hooks';
import TabMenu from '../../view/TabMenu';
import { getDisplayTab } from '../../store/slices/ui';
import { getSystemQuestions } from '../../store/slices/system';
import InputModal from './InputModal';

/** ------------------------------------------------------------------------- */

function QuestionsTab() {
  const display = useAppSelector(getDisplayTab("questions"));
  const questions = useAppSelector(getSystemQuestions);
  
  const first = Object.entries(questions)[0];

  return (
    <Stack padding={0} display={display}>
      <TabMenu>
        <Typography level="body-lg" pt={0.5} color="neutral"><i>Questions</i></Typography>
      </TabMenu>
      <Stack padding={2} spacing={2}>
        {first != null && <InputModal key={first[0]} question={first[1]} />}
      </Stack>
    </Stack>
  );
}

/** ------------------------------------------------------------------------- */

export default React.memo(QuestionsTab);