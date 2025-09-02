import React from 'react';
import Stack from '@mui/joy/Stack';
import Typography from '@mui/joy/Typography';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import TabMenu from '../../view/TabMenu';
import { getDisplayTab } from '../../store/slices/ui';
import { getSystemQuestions } from '../../store/slices/system';
import InputModal from './InputModal';
import { Alert, Button, Divider, IconButton, Tooltip } from '@mui/joy';
import { clearAllQuestions, pullQuestions } from '../../store/slices/thunk';
import DeleteRounded from '@mui/icons-material/DeleteRounded';

/** ------------------------------------------------------------------------- */

function QuestionsTab() {
  const display = useAppSelector(getDisplayTab("questions"));
  const questions = useAppSelector(getSystemQuestions);
  const dispatch = useAppDispatch();

  const handleIgnoreAll = React.useCallback(async (event: React.UIEvent) => {
    event.preventDefault();

    const reply = await dispatch(clearAllQuestions()).unwrap();
    if (reply.ok) {
      dispatch(pullQuestions());
    }
  }, [dispatch]);

  const handleRefresh = React.useCallback(() => {
    dispatch(pullQuestions());
  }, [dispatch]);

  return (
    <Stack padding={0} display={display} height={1} boxSizing="border-box" position="relative">
      <TabMenu>
        <Typography py={0.5} level="body-lg" color="neutral"><i>{questions.ok ? questions.data.length : "No"} Question(s) Left</i></Typography>
        <Stack direction="row" spacing={1} position="absolute" right={0}>
          <Button variant="outlined" color='neutral' size='sm' sx={{ borderRadius: 1000 }} onClick={handleRefresh}>
            Refresh
          </Button>
          <Tooltip title="Clear Questions">
            <IconButton onClick={handleIgnoreAll} sx={{ borderRadius: 1000 }}>
              <DeleteRounded fontSize='small'/>
            </IconButton>
          </Tooltip>
        </Stack>
      </TabMenu>
      <Divider orientation='horizontal'/>
      <Stack padding={2} spacing={2} px={8}>
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