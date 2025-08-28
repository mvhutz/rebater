import { Input, InputProps } from "@mui/joy";
import React from 'react';
import { getExcelFromIndex, getIndexFromExcel } from "../../shared/util";

/** ------------------------------------------------------------------------- */

interface ColumnInputProps extends InputProps {
  data: number | undefined;
  setData: (v: number | undefined) => void;
}

function ColumnInput(props: ColumnInputProps) {
  const { data, setData, ...rest } = props;

  const handleChange = React.useCallback<React.ChangeEventHandler<HTMLInputElement>>(e => {
    const value = e.target.value === "" ? undefined : e.target.value;
    const index = value != null ? getIndexFromExcel(value.toUpperCase()) : undefined;
    setData(index);
  }, [setData]);

  const value = data != null ? getExcelFromIndex(data) : "";

  return <Input variant='soft' value={value} onChange={handleChange} {...rest} />
}

/** ------------------------------------------------------------------------- */

export default React.memo(ColumnInput);