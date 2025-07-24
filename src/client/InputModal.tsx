import React from 'react';
import Button from '@mui/joy/Button';
import DialogContent from '@mui/joy/DialogContent';
import DialogTitle from '@mui/joy/DialogTitle';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import Input from '@mui/joy/Input';
import Modal from '@mui/joy/Modal';
import ModalDialog from '@mui/joy/ModalDialog';
import Stack from '@mui/joy/Stack';
import Markdown from 'react-markdown';
import { getCurrentQuestion, popQuestion } from './store/slices/system';
import { useAppDispatch, useAppSelector } from './store/hooks';

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
  
  const handleClose = React.useCallback(() => {
    invoke.answerQuestion({ question, value: undefined });
  }, [question]);
  
  return (
    <Modal open={open} onClose={handleClose}>
        <ModalDialog>
          <DialogTitle>Rebator needs your help!</DialogTitle>
          <DialogContent>
            <Markdown>
              {question}
            </Markdown>
            </DialogContent>
          <form onSubmit={handleForm}>
            <Stack spacing={2}>
              <FormControl>
                <FormLabel>Answer</FormLabel>
                <Input name="answer" required />
              </FormControl>
              <Button type="submit">Submit</Button>
            </Stack>
          </form>
        </ModalDialog>
      </Modal>
  );
}

/** ------------------------------------------------------------------------- */

export default React.memo(InputModal);
