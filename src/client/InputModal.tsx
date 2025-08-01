import React from 'react';
import Button from '@mui/joy/Button';
import DialogContent from '@mui/joy/DialogContent';
import DialogTitle from '@mui/joy/DialogTitle';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import Input from '@mui/joy/Input';
import Modal from '@mui/joy/Modal';
import ModalDialog from '@mui/joy/ModalDialog';
import Markdown from 'react-markdown';
import { clearQuestions, getCurrentQuestion, popQuestion } from './store/slices/system';
import { useAppDispatch, useAppSelector } from './store/hooks';
import { Box, ButtonGroup, DialogActions, IconButton, Sheet } from '@mui/joy';
import NotificationsPausedRoundedIcon from '@mui/icons-material/NotificationsPausedRounded';

/** ------------------------------------------------------------------------- */

const { invoke } = window.api;

function InputModal() {
  const question = useAppSelector(getCurrentQuestion);
  const dispatch = useAppDispatch();
  const open = question != null;

  const handleForm = React.useCallback((event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    
    invoke.answerQuestion({
      question,
      value: data.get("answer")?.toString()
    });
    dispatch(popQuestion());
  }, [dispatch, question]);
  
  const handleClose = React.useCallback(async (event: React.UIEvent) => {
    event.preventDefault();
    invoke.exitProgram();
    dispatch(clearQuestions());
  }, [dispatch]);

  const handleIgnore = React.useCallback((event: React.UIEvent) => {
    event.preventDefault();
    invoke.answerQuestion({ question, value: undefined });
    dispatch(popQuestion());
  }, [dispatch, question]);

  const handleIgnoreAll = React.useCallback((event: React.UIEvent) => {
    event.preventDefault();
    invoke.ignoreAll();
    dispatch(clearQuestions());
  }, [dispatch]);
  
  return (
    <Modal open={open} onClose={handleClose}>
        <ModalDialog minWidth={500}>
          <form onSubmit={handleForm}>
            <DialogTitle>Rebator needs your help!</DialogTitle>
            <DialogContent>
              <Sheet>
                <Markdown>
                  {question}
                </Markdown>
              </Sheet>
              <FormControl>
                <FormLabel>Answer</FormLabel>
                <Input name="answer" required autoFocus={true} />
              </FormControl>
            </DialogContent>
            <DialogActions sx={{ mt: 2 }}>
              <Button type="submit">Submit</Button>
              <ButtonGroup variant="outlined" color="neutral">
                <Button onClick={handleIgnore}>Later</Button>
                <IconButton onClick={handleIgnoreAll}><NotificationsPausedRoundedIcon/></IconButton>
              </ButtonGroup>
              <Box width={1}/>
              <Button type="button" variant="outlined" color="danger" onClick={handleClose}>Quit</Button>
            </DialogActions>
          </form>
        </ModalDialog>
      </Modal>
  );
}

/** ------------------------------------------------------------------------- */

export default React.memo(InputModal);
