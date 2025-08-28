import React from 'react';
import Stack from '@mui/joy/Stack';
import Typography from '@mui/joy/Typography';
// import QuestionMarkRoundedIcon from '@mui/icons-material/QuestionMarkRounded';
import { useAppSelector } from '../../store/hooks';
import TabMenu from '../../view/TabMenu';
import { getDisplayTab } from '../../store/slices/ui';
import { getSystemQuestions } from '../../store/slices/system';
import InputModal from './InputModal';
import { Alert } from '@mui/joy';

/** ------------------------------------------------------------------------- */

function QuestionsTab() {
  const display = useAppSelector(getDisplayTab("questions"));
  const questions = useAppSelector(getSystemQuestions);

  return (
    <Stack padding={0} display={display} height={1} boxSizing="border-box" position="relative">
      <TabMenu>
        <Typography level="body-lg" pt={0.5} color="neutral"><i>Questions</i></Typography>
      </TabMenu>
      <Stack padding={2} spacing={2}>
        {questions.ok && questions.data.length > 0 &&
          <InputModal question={questions.data[0]} />
        }
      </Stack>
      {!questions.ok &&
        <Stack sx={{ position: "absolute", bottom: 1 }} padding={2} width={1} boxSizing="border-box">
          <Alert variant="soft" sx={{ alignItems: 'flex-start' }}>
            <div>
              <div>Questions Error!</div>
              <Typography level="body-sm" fontWeight="400" color="neutral">
                {questions.reason}
              </Typography>
            </div>
          </Alert>
        </Stack>
      }
      {questions.ok && questions.data.length === 0 &&
        <Stack sx={{ position: "absolute", bottom: 1 }} padding={2} width={1} boxSizing="border-box">
          <Alert variant="soft" sx={{ alignItems: 'flex-start' }}>
            <div>
              <div>No Questions!</div>
              <Typography level="body-sm" fontWeight="400" color="neutral">
                You all caught up! Rebater has no more prompts to answer.
              </Typography>
            </div>
          </Alert>
        </Stack>
      }
    </Stack>
  );
}

/** ------------------------------------------------------------------------- */

export default React.memo(QuestionsTab);