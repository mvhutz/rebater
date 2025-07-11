import React from 'react';
import { useAppSelector } from './store/hooks';
import { getSystemStatus } from './store/slices/system';
import { Button, DialogContent, DialogTitle, FormControl, FormLabel, Input, Modal, ModalDialog, Stack } from '@mui/joy';

/** ------------------------------------------------------------------------- */

const { invoke } = window.api;

function InputModal() {
  const status = useAppSelector(getSystemStatus);
  const open = status.type === "asking";
  const question = status.type === "asking" ? status.question : null;

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
          <DialogContent>{question}</DialogContent>
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
