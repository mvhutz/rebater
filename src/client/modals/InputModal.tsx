import React from 'react';
import Button from '@mui/joy/Button';
import DialogContent from '@mui/joy/DialogContent';
import DialogTitle from '@mui/joy/DialogTitle';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import Input from '@mui/joy/Input';
import Modal from '@mui/joy/Modal';
import ModalDialog from '@mui/joy/ModalDialog';
import { clearQuestions, getCurrentQuestion, popQuestion } from '../store/slices/system';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { Box, ButtonGroup, Checkbox, DialogActions, IconButton, ModalOverflow, Stack, Table } from '@mui/joy';
import NotificationsPausedRoundedIcon from '@mui/icons-material/NotificationsPausedRounded';
import { Typography } from '@mui/material';
import Markdown from 'react-markdown';

/** ------------------------------------------------------------------------- */

const { invoke } = window.api;

function InputModal() {
  const question = useAppSelector(getCurrentQuestion);
  const dispatch = useAppDispatch();
  const open = question != null;

  const [known, setKnown] = React.useState<Record<string, string>>({});
  const [optional, setOptional] = React.useState<string[]>([]);

  React.useEffect(() => {
    if (question == null) {
      setKnown({});
      return;
    }

    const result: Record<string, string> = {};

    for (const [property, value] of Object.entries(question.known)) {
      result[property] = value;
    }

    setKnown(result);
  }, [question]);

  React.useEffect(() => {
    if (question == null) {
      setOptional([]);
      return;
    }

    setOptional(question.optional);
  }, [question]);

  const handleForm = React.useCallback((event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const { hash, unknown } = question;

    const known_copy = {...known};
    for (const option of optional) {
      known_copy[option] = "*"
    }

    const answer = data.get("answer")?.toString();
    event.currentTarget.reset();
    
    if (answer == null) {
      invoke.answerQuestion({ answer: undefined, hash });
    } else {
      invoke.answerQuestion({
        hash,
        answer: {
          ...known_copy,
          [unknown]: answer
        }
      });
    }

    dispatch(popQuestion());
  }, [dispatch, known, optional, question]);

  const handleClose = React.useCallback(async (event: React.UIEvent) => {
    event.preventDefault();
    invoke.exitProgram({});
    dispatch(clearQuestions());
  }, [dispatch]);

  const handleIgnore = React.useCallback((event: React.UIEvent) => {
    event.preventDefault();
    invoke.answerQuestion({ answer: undefined, hash: question.hash });
    dispatch(popQuestion());
  }, [dispatch, question]);

  const handleIgnoreAll = React.useCallback((event: React.UIEvent) => {
    event.preventDefault();
    invoke.ignoreAll({});
    dispatch(clearQuestions());
  }, [dispatch]);

  const toggleOptional = React.useCallback((value: string) => {
    setOptional(o => {
      if (o.includes(value)) {
        return o.filter(v => v !== value);
      } else {
        return o.concat([value]);
      }
    })
  }, []);

  let inside: Maybe<React.ReactElement> = null;

  if (question != null) {
    inside = (
      <>
        <Typography>We do not know the <code>{question.unknown}</code> of this <code>{question.table}</code>:</Typography>
        <Table noWrap>
          <thead>
            <tr>
              <th>Property</th>
              <th>Value</th>
              <th style={{ width: "60px" }}>Require</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(question.known).map(([property, value]) => (
              <tr key={property}>
                <td><code>{property}</code></td>
                <td style={{ whiteSpace: "nowrap" }}>
                  {value}
                </td>
                <td style={{ width: "60px" }}>
                  <Checkbox checked={!optional.includes(property)} onChange={toggleOptional.bind(null, property)} size="sm"></Checkbox>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
        {question.suggestions.length > 0 && <>
          <Typography>Here are some suggestions:</Typography>
          <ul>
            {question.suggestions.map(s => (
              <li style={{ margin: 0 }}><Markdown>{s}</Markdown></li>
            ))}
          </ul>
        </>}
      </>
    );
  }

  return (
    <Modal open={open} onClose={handleClose}>
      <ModalOverflow>
        <ModalDialog minWidth={500} layout="center">
          <form onSubmit={handleForm}>
            <DialogTitle>Rebater needs your help!</DialogTitle>
            <DialogContent>
              <Stack spacing={2}>
                {inside}
                <FormControl>
                  <FormLabel>Answer</FormLabel>
                  <Input name="answer" required autoFocus={true} />
                </FormControl>
              </Stack>
            </DialogContent>
            <DialogActions sx={{ mt: 2 }}>
              <Button type="submit">Submit</Button>
              <ButtonGroup variant="outlined" color="neutral">
                <Button onClick={handleIgnore}>Later</Button>
                <IconButton onClick={handleIgnoreAll}><NotificationsPausedRoundedIcon /></IconButton>
              </ButtonGroup>
              <Box width={1} />
              <Button type="button" variant="outlined" color="danger" onClick={handleClose}>Quit</Button>
            </DialogActions>
          </form>
        </ModalDialog>
      </ModalOverflow>
    </Modal>
  );
}

/** ------------------------------------------------------------------------- */

export default React.memo(InputModal);
