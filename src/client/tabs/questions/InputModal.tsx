import React from 'react';
import Button from '@mui/joy/Button';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import Input from '@mui/joy/Input';
import { useAppDispatch } from '../../store/hooks';
import { Typography, Checkbox, Stack, Table } from '@mui/joy';
import Markdown from 'react-markdown';
import { Question } from '../../../shared/worker/response';
import { deleteQuestion } from '../../store/slices/system';
import { pushMessage } from '../../store/slices/ui';
import { Card } from '@mui/material';

/** ------------------------------------------------------------------------- */

const { invoke } = window.api;

function InputModal({ question }: { question: Question }) {
  const dispatch = useAppDispatch();

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

  const handleForm = React.useCallback(async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const { currentTarget } = event;
    
    const data = new FormData(currentTarget);
    const { hash, unknown } = question;

    const known_copy = {...known};
    for (const option of optional) {
      known_copy[option] = "*"
    }

    const answer = data.get("answer")?.toString();
    if (answer == null) return;

    const answered = await invoke.answerQuestion({
      hash,
      answer: {
        ...known_copy,
        [unknown]: answer
      },
      reference: question.table
    });
    if (!answered.ok) {
      dispatch(pushMessage({ type: "error", text: answered.reason }));
      return;
    }

    currentTarget.reset();

    dispatch(deleteQuestion(question));
  }, [dispatch, known, optional, question]);

  const handleIgnore = React.useCallback(async (event: React.UIEvent) => {
    event.preventDefault();

    await invoke.ignoreQuestion(question);
    dispatch(deleteQuestion(question));
  }, [dispatch, question]);

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
        <Card variant='outlined' sx={{ borderRadius: 2, }}>
          <Table size='sm' noWrap>
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
        </Card>
        {question.suggestions.length > 0 && <>
          <Typography>Here are some suggestions:</Typography>
          <ul>
            {question.suggestions.map((s, i) => (
              <li style={{ margin: 0 }} key={i}><Markdown>{s}</Markdown></li>
            ))}
          </ul>
        </>}
      </>
    );
  }

  return (
    // <Card>
      <form onSubmit={handleForm}>
          <Stack spacing={2}>
            {inside}
            <FormControl>
              <FormLabel>Answer</FormLabel>
              <Input variant='soft' name="answer" required autoFocus={true} />
            </FormControl>
          </Stack>
        <Stack mt={2} direction="row" spacing={2} justifyContent="flex-end" width={1}>
          <Button color="neutral" variant="outlined" onClick={handleIgnore}>Ignore</Button>
          <Button type="submit">Submit</Button>
        </Stack>
      </form>
    // </Card>
  );
}

/** ------------------------------------------------------------------------- */

export default React.memo(InputModal);
