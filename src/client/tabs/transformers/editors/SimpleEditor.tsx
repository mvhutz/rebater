import React, { useContext } from 'react';
import Stack from '@mui/joy/Stack';
import Typography from '@mui/joy/Typography';
import { FormControl, FormLabel, AccordionSummary, AccordionGroup, Accordion, AccordionDetails, FormHelperText, Input, Switch, Textarea, Card, Option, Select, Sheet } from '@mui/joy';
import MultiSelect from '../../MultiSelect';
import ColumnInput from '../../ColumnInput';
import { Draft, produce } from 'immer';
import { SimpleTransformerDraft } from '../../../store/slices/drafts';
import { useAppDispatch } from '../../../store/hooks';
import { updateTransformerDraft } from '../../../store/slices/system';

/** ------------------------------------------------------------------------- */

const SimpleContext = React.createContext<[
  SimpleTransformerDraft,
  (fn: (state: Draft<SimpleTransformerDraft>) => void) => void
]>([null as unknown as SimpleTransformerDraft, fn => { void fn; }])

/** ------------------------------------------------------------------------- */

function SourceOptions() {
  const [data, setData] = useContext(SimpleContext);
  const handleSheets = React.useCallback((v: string[]) => {
    setData(d => { d.source.sheets = v; });
  }, [setData]);

  const handleFilename = React.useCallback<React.ChangeEventHandler<HTMLInputElement>>(e => {
    const value = e.target.value === "" ? undefined : e.target.value;
    setData(d => { d.source.file = value; });
  }, [setData]);

  return (
    <Accordion>
      <AccordionSummary>
        <Typography>
          Sources
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Stack spacing={3} mt={2}>
          <FormControl sx={{ flex: 1 }}>
            <FormLabel>File Name</FormLabel>
            <Input variant='soft' placeholder="Input file name..." value={data.source.file} onChange={handleFilename} />
            <FormHelperText>Supports&nbsp;<code>glob</code>&nbsp;expressions.</FormHelperText>
          </FormControl>
          <FormControl sx={{ flex: 1 }}>
            <FormLabel>Sheets</FormLabel>
            <MultiSelect placeholder="Input sheet names..." values={data.source.sheets} onValues={handleSheets} />
            <FormHelperText>Supports regular expressions.</FormHelperText>
          </FormControl>
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
}

function TuneOptions() {
  const [data, setData] = useContext(SimpleContext);

  const handleCanadian = React.useCallback<React.ChangeEventHandler<HTMLInputElement>>(e => {
    setData(d => { d.options.canadian_rebate = e.target.checked; });
  }, [setData]);

  const handleNull = React.useCallback<React.ChangeEventHandler<HTMLInputElement>>(e => {
    setData(d => { d.options.remove_null_rebates = e.target.checked; });
  }, [setData]);

  const handlePreprocessing = React.useCallback<React.ChangeEventHandler<HTMLTextAreaElement>>(e => {
    const value = e.target.value === "" ? undefined : e.target.value;
    setData(d => { d.options.additional_preprocessing = value; });
  }, [setData]);

  const handlePostprocessing = React.useCallback<React.ChangeEventHandler<HTMLTextAreaElement>>(e => {
    const value = e.target.value === "" ? undefined : e.target.value;
    setData(d => { d.options.additional_postprocessing = value; });
  }, [setData]);

  return (
    <Accordion>
      <AccordionSummary>
        <Typography>
          Options
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Stack spacing={3} mt={2}>
          <FormControl>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <FormLabel>Canadian Rebate</FormLabel>
              <Switch checked={data.options.canadian_rebate} onChange={handleCanadian} size='sm' />
            </Stack>
            <FormHelperText>Select this property if this source group contains Canadian data.</FormHelperText>
          </FormControl>
          <FormControl>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <FormLabel>Remove Null Rebates</FormLabel>
              <Switch checked={data.options.remove_null_rebates} onChange={handleNull} size='sm' />
            </Stack>
            <FormHelperText>Get rid of all rebates that have $0.00 as its rebate amount.</FormHelperText>
          </FormControl>
          <FormControl>
            <FormLabel>Additional Pre-processiong</FormLabel>
            <Textarea variant='soft' minRows={2} value={data.options.additional_preprocessing ?? ""} onChange={handlePreprocessing} sx={{ fontFamily: "monospace" }} size='sm' />
            <FormHelperText>Add additional operations before the rebate data is extracted. Input is JSON.</FormHelperText>
          </FormControl>
          <FormControl>
            <FormLabel>Additional Post-processiong</FormLabel>
            <Textarea variant='soft' minRows={2} value={data.options.additional_postprocessing ?? ""} onChange={handlePostprocessing} sx={{ fontFamily: "monospace" }} size='sm' />
            <FormHelperText>Add additional operations after the rebate data is extracted. Input is JSON.</FormHelperText>
          </FormControl>
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
}

function TransactionDateOptions() {
  const [data, setData] = useContext(SimpleContext);
  const { column, parse } = data.properties.transactionDate;

  const handleColumn = React.useCallback((c?: number) => {
    setData(d => { d.properties.transactionDate.column = c; });
  }, [setData]);

  const handleParse = React.useCallback<React.ChangeEventHandler<HTMLInputElement>>(e => {
    const value = e.target.value === "" ? undefined : e.target.value;
    setData(d => { d.properties.transactionDate.parse = value; });
  }, [setData]);

  return (
    <Card orientation="horizontal" size='sm'>
      <Typography level="title-lg" flex={1}>Transaction Date</Typography>
      <Stack spacing={2} flex={1}>
        <FormControl>
          <FormLabel>Column</FormLabel>
          <ColumnInput data={column} setData={handleColumn} placeholder='Enter Column Id...' />
        </FormControl>
        <FormControl>
          <FormLabel>Date Format?</FormLabel>
          <Input variant='soft' value={parse ?? ""} onChange={handleParse} placeholder='M/D/YYYY...' />
        </FormControl>
      </Stack>
    </Card>
  );
}

function InvoiceDateOptions() {
  const [data, setData] = useContext(SimpleContext);
  const { column, parse } = data.properties.invoiceDate;

  const handleColumn = React.useCallback((c?: number) => {
    setData(d => { d.properties.invoiceDate.column = c; });
  }, [setData]);

  const handleParse = React.useCallback<React.ChangeEventHandler<HTMLInputElement>>(e => {
    const value = e.target.value === "" ? undefined : e.target.value;
    setData(d => { d.properties.invoiceDate.parse = value; });
  }, [setData]);

  return (
    <Card orientation="horizontal" size='sm'>
      <Typography level="title-lg" flex={1}>Invoice Date</Typography>
      <Stack spacing={2} flex={1}>
        <FormControl>
          <FormLabel>Column</FormLabel>
          <ColumnInput data={column} setData={handleColumn} placeholder='Enter Column Id...' />
        </FormControl>
        <FormControl>
          <FormLabel>Date Format?</FormLabel>
          <Input variant='soft' value={parse ?? ""} onChange={handleParse} placeholder='M/D/YYYY...' />
        </FormControl>
      </Stack>
    </Card>
  );
}

function SupplierIdOptions() {
  const [data, setData] = useContext(SimpleContext);
  const { value } = data.properties.supplierId;

  const handleParse = React.useCallback<React.ChangeEventHandler<HTMLInputElement>>(e => {
    const value = e.target.value === "" ? undefined : e.target.value;
    setData(d => { d.properties.supplierId.value = value; });
  }, [setData]);

  return (
    <Card orientation="horizontal" size='sm'>
      <Typography level="title-lg" flex={1}>Supplier Id</Typography>
      <Stack spacing={2} flex={1}>
        <FormControl>
          <FormLabel>Value</FormLabel>
          <Input variant='soft' value={value ?? ""} onChange={handleParse} placeholder='Enter Id...' />
        </FormControl>
      </Stack>
    </Card>
  );
}

function MemberIdOptions() {
  const [data, setData] = useContext(SimpleContext);
  const { column } = data.properties.memberId;

  const handleColumn = React.useCallback((c?: number) => {
    setData(d => { d.properties.memberId.column = c; });
  }, [setData]);

  return (
    <Card orientation="horizontal" size='sm'>
      <Typography level="title-lg" flex={1}>Member Id</Typography>
      <Stack spacing={2} flex={1}>
        <FormControl>
          <FormLabel>Column</FormLabel>
          <ColumnInput data={column} setData={handleColumn} placeholder='Enter Column Id...' />
        </FormControl>
      </Stack>
    </Card>
  );
}

function InvoiceIdOptions() {
  const [data, setData] = useContext(SimpleContext);
  const { column } = data.properties.invoiceId;

  const handleColumn = React.useCallback((c?: number) => {
    setData(d => { d.properties.invoiceId.column = c; });
  }, [setData]);

  return (
    <Card orientation="horizontal" size='sm'>
      <Typography level="title-lg" flex={1}>Invoice Id</Typography>
      <Stack spacing={2} flex={1}>
        <FormControl>
          <FormLabel>Column</FormLabel>
          <ColumnInput data={column} setData={handleColumn} placeholder='Enter Column Id...' />
        </FormControl>
      </Stack>
    </Card>
  );
}

function PurchaseAmountOptions() {
  const [data, setData] = useContext(SimpleContext);
  const { column } = data.properties.purchaseAmount;

  const handleColumn = React.useCallback((c?: number) => {
    setData(d => { d.properties.purchaseAmount.column = c; });
  }, [setData]);

  return (
    <Card orientation="horizontal" size='sm'>
      <Typography level="title-lg" flex={1}>Purchase Amount</Typography>
      <Stack spacing={2} flex={1}>
        <FormControl>
          <FormLabel>Column</FormLabel>
          <ColumnInput data={column} setData={handleColumn} placeholder='Enter Column Id...' />
        </FormControl>
      </Stack>
    </Card>
  );
}

function RebateAmountOptions() {
  const [data, setData] = useContext(SimpleContext);
  const { column, multiplier } = data.properties.rebateAmount;

  const handleColumn = React.useCallback((c?: number) => {
    setData(d => { d.properties.rebateAmount.column = c; });
  }, [setData]);

  const handleMultipler = React.useCallback<React.ChangeEventHandler<HTMLInputElement>>(e => {
    const value = e.target.value === "" ? undefined : parseFloat(e.target.value);
    const num = isNaN(value ?? NaN) ? undefined : value;
    setData(d => { d.properties.rebateAmount.multiplier = num; });
  }, [setData]);

  return (
    <Card orientation="horizontal" size='sm'>
      <Typography level="title-lg" flex={1}>Rebate Amount</Typography>
      <Stack spacing={2} flex={1}>
        <FormControl>
          <FormLabel>Column</FormLabel>
          <ColumnInput data={column} setData={handleColumn} placeholder='Enter Column Id...' />
        </FormControl>
        <FormControl>
          <FormLabel>Multiplier?</FormLabel>
          <Input variant='soft' type="number" slotProps={{ input: { step: "any" } }} value={multiplier ?? ""} onChange={handleMultipler} placeholder='Enter optional multipler...' />
        </FormControl>
      </Stack>
    </Card>
  );
}

function DistributorIdOptions() {
  const [data, setData] = useContext(SimpleContext);
  const fields = data.properties.distributorName;

  const handleType = React.useCallback((_: unknown, c: "value" | "column" | null) => {
    if (c == null) return;
    setData(d => { d.properties.distributorName = { type: c }; });
  }, [setData]);

  const handleValue = React.useCallback<React.ChangeEventHandler<HTMLInputElement>>(e => {
    const value = e.target.value === "" ? undefined : e.target.value;
    setData(d => {
      if (d.properties.distributorName.type !== "value") return;
      d.properties.distributorName = { type: "value", value };
    });
  }, [setData]);

  const handleColumn = React.useCallback((column?: number) => {
    setData(d => {
      if (d.properties.distributorName.type !== "column") return;
      d.properties.distributorName = { type: "column", column };
    });
  }, [setData]);

  return (
    <Card orientation="horizontal" size='sm'>
      <Typography level="title-lg" flex={1}>Distributor Id</Typography>
      <Stack spacing={2} flex={1}>
        <FormControl>
          <FormLabel>Column</FormLabel>
          <Select value={fields.type} onChange={handleType} variant='soft'>
            <Option value="value" defaultChecked>Value</Option>
            <Option value="column">Column</Option>
          </Select>
        </FormControl>
        {fields.type === "column" ? (
          <FormControl>
            <FormLabel>Column</FormLabel>
            <ColumnInput data={fields.column} setData={handleColumn} placeholder='Enter Column Id...' />
          </FormControl>
        ) : (
          <FormControl>
            <FormLabel>Column</FormLabel>
            <Input variant='soft' value={fields.value ?? ""} onChange={handleValue} placeholder='Enter value...' />
          </FormControl>
        )
        }
      </Stack>
    </Card>
  );
}

function RebateDataOptions() {
  return (
    <Accordion>
      <AccordionSummary>
        <Typography>
          Rebate Data
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Stack spacing={2} mt={2}>
          <TransactionDateOptions />
          <SupplierIdOptions />
          <MemberIdOptions />
          <DistributorIdOptions />
          <PurchaseAmountOptions />
          <RebateAmountOptions />
          <InvoiceIdOptions />
          <InvoiceDateOptions />
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
}

/** ------------------------------------------------------------------------- */

interface SimpleTransformerEditProps {
  data: SimpleTransformerDraft;
}

function SimpleEditor(props: SimpleTransformerEditProps) {
  const { data } = props;
  const dispatch = useAppDispatch();

  const setData = React.useCallback((fn: (state: Draft<SimpleTransformerDraft>) => void) => {
    dispatch(updateTransformerDraft(produce(fn)(data)));
  }, [data, dispatch]);

  return (
    <SimpleContext.Provider value={[data, setData]}>
      <Stack flex={1} position="relative">
        <Sheet sx={{ overflow: "auto", flex: "1 1 0px" }}>
          <AccordionGroup disableDivider size="lg">
            <SourceOptions />
            <RebateDataOptions />
            <TuneOptions />
          </AccordionGroup>
        </Sheet>
      </Stack>
    </SimpleContext.Provider>
  );
}

/** ------------------------------------------------------------------------- */

export default React.memo(SimpleEditor);