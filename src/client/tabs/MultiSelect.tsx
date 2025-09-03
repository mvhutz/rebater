import React from 'react';
import Stack from '@mui/joy/Stack';
import { Chip, ChipDelete, Textarea } from '@mui/joy';

/** ------------------------------------------------------------------------- */

interface MultiSelectProps {
  values: string[];
  onValues: (v: string[]) => void;
  placeholder?: string;
}

function MultiSelect(props: MultiSelectProps) {
  const { values, onValues, placeholder } = props;
  const [text, setText] = React.useState("");

  const handleDelete = React.useCallback((index: number) => {
    onValues(values.toSpliced(index, 1));
  }, [onValues, values]);

  const handleKeyDown = React.useCallback<React.KeyboardEventHandler<HTMLTextAreaElement>>(e => {
    if (e.key !== 'Enter') return;

    e.preventDefault();
    e.stopPropagation();

    setText(t => {
      onValues(values.concat([t]))
      return "";
    })
  }, [onValues, values]);

  return <Stack direction="column" spacing={1}>
    <Textarea variant='soft' placeholder={placeholder} value={text} onChange={e => { setText(e.target.value) }} onKeyDown={handleKeyDown} endDecorator={
      values.length > 0 && <Stack direction="row" flexWrap="wrap" gap={0.5}>
        {values.map((v, i) => (
          <Chip key={v} color="primary" endDecorator={<ChipDelete onDelete={() => { handleDelete(i) }} />}>{v}</Chip>
        ))}
      </Stack>
    } />
  </Stack>
}

export default React.memo(MultiSelect);
