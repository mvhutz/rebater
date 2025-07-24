import React from 'react';
// import { useAppSelector } from './store/hooks';
// import { getSystemStatus } from './store/slices/system';
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

/** ------------------------------------------------------------------------- */

const { invoke } = window.api;

function InputModal() {
  // const status = useAppSelector(getSystemStatus);
  const open = false; // status.type === "asking";
  const question = null; // status.type === "asking" ? status.question : null;

  const handleForm = React.useCallback((event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    
    invoke.answerQuestion(data.get("answer")?.toString());
  }, []);
  
  const handleClose = React.useCallback(() => {
    invoke.answerQuestion(undefined);
  }, []);
  
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
