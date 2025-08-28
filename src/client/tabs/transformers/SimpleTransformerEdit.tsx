import React from 'react';
import Stack from '@mui/joy/Stack';
import Typography from '@mui/joy/Typography';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import RestoreRoundedIcon from '@mui/icons-material/RestoreRounded';
import { Button, IconButton, FormControl, FormLabel, AccordionSummary, AccordionGroup, Accordion, AccordionDetails, FormHelperText, Input, Switch, Textarea, Card, Option, Select } from '@mui/joy';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import { useAppDispatch } from '../../store/hooks';
import { pullTransformers } from '../../store/slices/thunk';
import DocumentScannerIcon from '@mui/icons-material/DocumentScanner';
import SummarizeRoundedIcon from '@mui/icons-material/SummarizeRounded';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import MultiSelect from '../MultiSelect';
import ColumnInput from '../ColumnInput';
import { produce } from 'immer';
import { TransformerFile } from '../../../shared/state/stores/TransformerStore';
import { good, GoodReply } from '../../../shared/reply';
import { SimpleTransformerData } from '../../../shared/transformer/simple';

/** ------------------------------------------------------------------------- */

interface OptionsProps {
  data: SimpleTransformerData;
  setData: React.Dispatch<React.SetStateAction<SimpleTransformerData>>;
}

function SourceOptions(props: OptionsProps) {
  const { data, setData } = props;
  const handleSheets = React.useCallback((v: string[]) => {
    setData(d => ({ ...d, source: { ...d.source, sheets: v } }));
  }, [setData]);

  const handleFilename = React.useCallback<React.ChangeEventHandler<HTMLInputElement>>(e => {
    const value = e.target.value === "" ? undefined : e.target.value;
    setData(d => ({ ...d, source: { ...d.source, file: value } }));
  }, [setData]);

  return (
    <Accordion>
      <AccordionSummary>
        <Typography level="h4" startDecorator={<DocumentScannerIcon />}>
          Sources
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Stack spacing={3} mt={2}>
          <FormControl sx={{ flex: 1 }}>
            <FormLabel>File Name</FormLabel>
            <Input placeholder="Input file name..." value={data.source.file} onChange={handleFilename} />
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

function TuneOptions(props: OptionsProps) {
  const { data, setData } = props;

  const handleCanadian = React.useCallback<React.ChangeEventHandler<HTMLInputElement>>(e => {
    setData(d => ({ ...d, options: { ...d.options, canadian_rebate: e.target.checked } }));
  }, [setData]);

  const handleNull = React.useCallback<React.ChangeEventHandler<HTMLInputElement>>(e => {
    setData(d => ({ ...d, options: { ...d.options, remove_null_rebates: e.target.checked } }));
  }, [setData]);

  const handlePreprocessing = React.useCallback<React.ChangeEventHandler<HTMLTextAreaElement>>(e => {
    const value = e.target.value === "" ? undefined : e.target.value;
    setData(d => ({ ...d, options: { ...d.options, additional_preprocessing: value } }));
  }, [setData]);

  const handlePostprocessing = React.useCallback<React.ChangeEventHandler<HTMLTextAreaElement>>(e => {
    const value = e.target.value === "" ? undefined : e.target.value;
    setData(d => ({ ...d, options: { ...d.options, additional_postprocessing: value } }));
  }, [setData]);

  return (
    <Accordion>
      <AccordionSummary>
        <Typography level="h4" startDecorator={<TuneRoundedIcon />}>
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
            <Textarea minRows={2} value={data.options.additional_preprocessing ?? ""} onChange={handlePreprocessing} sx={{ fontFamily: "monospace" }} size='sm' />
            <FormHelperText>Add additional operations before the rebate data is extracted. Input is JSON.</FormHelperText>
          </FormControl>
          <FormControl>
            <FormLabel>Additional Post-processiong</FormLabel>
            <Textarea minRows={2} value={data.options.additional_postprocessing ?? ""} onChange={handlePostprocessing} sx={{ fontFamily: "monospace" }} size='sm' />
            <FormHelperText>Add additional operations after the rebate data is extracted. Input is JSON.</FormHelperText>
          </FormControl>
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
}

function TransactionDateOptions(props: OptionsProps) {
  const { data, setData } = props;
  const { column, parse } = data.properties.transactionDate;

  const handleColumn = React.useCallback((c?: number) => {
    setData(produce(d => { d.properties.transactionDate.column = c; }));
  }, [setData]);

  const handleParse = React.useCallback<React.ChangeEventHandler<HTMLInputElement>>(e => {
    const value = e.target.value === "" ? undefined : e.target.value;
    setData(produce(d => { d.properties.transactionDate.parse = value; }));
  }, [setData]);

  return (
    <Card orientation="horizontal" size='sm'>
      <Typography level="title-lg" flex={1}>Transaction Date</Typography>
      <Stack spacing={2} flex={1}>
        <FormControl>
          <FormLabel>Column</FormLabel>
          <ColumnInput data={column} setData={handleColumn} placeholder='Enter Column Id...'/>
        </FormControl>
        <FormControl>
          <FormLabel>Date Format?</FormLabel>
          <Input variant='soft' value={parse ?? ""} onChange={handleParse} placeholder='M/D/YYYY...' />
        </FormControl>
      </Stack>
    </Card>
  );
}

function InvoiceDateOptions(props: OptionsProps) {
  const { data, setData } = props;
  const { column, parse } = data.properties.invoiceDate;

  const handleColumn = React.useCallback((c?: number) => {
    setData(produce(d => { d.properties.invoiceDate.column = c; }));
  }, [setData]);

  const handleParse = React.useCallback<React.ChangeEventHandler<HTMLInputElement>>(e => {
    const value = e.target.value === "" ? undefined : e.target.value;
    setData(produce(d => { d.properties.invoiceDate.parse = value; }));
  }, [setData]);

  return (
    <Card orientation="horizontal" size='sm'>
      <Typography level="title-lg" flex={1}>Invoice Date</Typography>
      <Stack spacing={2} flex={1}>
        <FormControl>
          <FormLabel>Column</FormLabel>
          <ColumnInput data={column} setData={handleColumn} placeholder='Enter Column Id...'/>
        </FormControl>
        <FormControl>
          <FormLabel>Date Format?</FormLabel>
          <Input variant='soft' value={parse ?? ""} onChange={handleParse} placeholder='M/D/YYYY...' />
        </FormControl>
      </Stack>
    </Card>
  );
}

function SupplierIdOptions(props: OptionsProps) {
  const { data, setData } = props;
  const { value } = data.properties.supplierId;

  const handleParse = React.useCallback<React.ChangeEventHandler<HTMLInputElement>>(e => {
    const value = e.target.value === "" ? undefined : e.target.value;
    setData(produce(d => { d.properties.supplierId.value = value; }));
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

function MemberIdOptions(props: OptionsProps) {
  const { data, setData } = props;
  const { column } = data.properties.memberId;

  const handleColumn = React.useCallback((c?: number) => {
    setData(produce(d => { d.properties.memberId.column = c; }));
  }, [setData]);

  return (
    <Card orientation="horizontal" size='sm'>
      <Typography level="title-lg" flex={1}>Member Id</Typography>
      <Stack spacing={2} flex={1}>
        <FormControl>
          <FormLabel>Column</FormLabel>
          <ColumnInput data={column} setData={handleColumn} placeholder='Enter Column Id...'/>
        </FormControl>
      </Stack>
    </Card>
  );
}

function InvoiceIdOptions(props: OptionsProps) {
  const { data, setData } = props;
  const { column } = data.properties.invoiceId;

  const handleColumn = React.useCallback((c?: number) => {
    setData(produce(d => { d.properties.invoiceId.column = c; }));
  }, [setData]);

  return (
    <Card orientation="horizontal" size='sm'>
      <Typography level="title-lg" flex={1}>Invoice Id</Typography>
      <Stack spacing={2} flex={1}>
        <FormControl>
          <FormLabel>Column</FormLabel>
          <ColumnInput data={column} setData={handleColumn} placeholder='Enter Column Id...'/>
        </FormControl>
      </Stack>
    </Card>
  );
}

function PurchaseAmountOptions(props: OptionsProps) {
  const { data, setData } = props;
  const { column } = data.properties.purchaseAmount;

  const handleColumn = React.useCallback((c?: number) => {
    setData(produce(d => { d.properties.purchaseAmount.column = c; }));
  }, [setData]);

  return (
    <Card orientation="horizontal" size='sm'>
      <Typography level="title-lg" flex={1}>Purchase Amount</Typography>
      <Stack spacing={2} flex={1}>
        <FormControl>
          <FormLabel>Column</FormLabel>
          <ColumnInput data={column} setData={handleColumn} placeholder='Enter Column Id...'/>
        </FormControl>
      </Stack>
    </Card>
  );
}

function RebateAmountOptions(props: OptionsProps) {
  const { data, setData } = props;
  const { column, multiplier } = data.properties.rebateAmount;

  const handleColumn = React.useCallback((c?: number) => {
    setData(produce(d => { d.properties.rebateAmount.column = c; }));
  }, [setData]);

  const handleMultipler = React.useCallback<React.ChangeEventHandler<HTMLInputElement>>(e => {
    const value = e.target.value === "" ? undefined : parseFloat(e.target.value);
    const num = isNaN(value ?? NaN) ? undefined : value;
    setData(produce(d => { d.properties.rebateAmount.multiplier = num; }));
  }, [setData]);

  return (
    <Card orientation="horizontal" size='sm'>
      <Typography level="title-lg" flex={1}>Rebate Amount</Typography>
      <Stack spacing={2} flex={1}>
        <FormControl>
          <FormLabel>Column</FormLabel>
          <ColumnInput data={column} setData={handleColumn} placeholder='Enter Column Id...'/>
        </FormControl>
        <FormControl>
          <FormLabel>Multiplier?</FormLabel>
          <Input variant='soft' type="number" slotProps={{ input: { step: "any" } }} value={multiplier ?? ""} onChange={handleMultipler} placeholder='Enter optional multipler...' />
        </FormControl>
      </Stack>
    </Card>
  );
}

function DistributorIdOptions(props: OptionsProps) {
  const { data, setData } = props;
  const fields = data.properties.distributorName;

  const handleType = React.useCallback((_: unknown, c: "value" | "column" | null) => {
    if (c == null) return;
    setData(produce(d => { d.properties.distributorName = { type: c }; }));
  }, [setData]);

  const handleValue = React.useCallback<React.ChangeEventHandler<HTMLInputElement>>(e => {
    const value = e.target.value === "" ? undefined : e.target.value;
    setData(produce(d => {
      if (d.properties.distributorName.type !== "value") return;
      d.properties.distributorName = { type: "value", value };
    }));
  }, [setData]);

  const handleColumn = React.useCallback((column?: number) => {
    setData(produce(d => {
      if (d.properties.distributorName.type !== "column") return;
      d.properties.distributorName = { type: "column", column };
    }));
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
        { fields.type === "column"? (
          <FormControl>
            <FormLabel>Column</FormLabel>
            <ColumnInput data={fields.column} setData={handleColumn} placeholder='Enter Column Id...'/>
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

function RebateDataOptions(props: OptionsProps) {
  const { data, setData } = props;

  return (
    <Accordion>
      <AccordionSummary>
        <Typography level="h4" startDecorator={<SummarizeRoundedIcon />}>
          Rebate Data
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Stack spacing={2} mt={2}>
          <TransactionDateOptions data={data} setData={setData}/>
          <SupplierIdOptions data={data} setData={setData}/>
          <MemberIdOptions data={data} setData={setData}/>
          <DistributorIdOptions data={data} setData={setData}/>
          <PurchaseAmountOptions data={data} setData={setData}/>
          <RebateAmountOptions data={data} setData={setData}/>
          <InvoiceIdOptions data={data} setData={setData}/>
          <InvoiceDateOptions data={data} setData={setData}/>
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
}

/** ------------------------------------------------------------------------- */

const { invoke } = window.api;

interface SimpleTransformerEditProps {
  item: TransformerFile["item"];
  data: GoodReply<SimpleTransformerData>
}

function AdvancedTransformerEdit(props: SimpleTransformerEditProps) {
  const { item, data: info } = props;
  const [data, setData] = React.useState<SimpleTransformerData>(info.data);
  const dispatch = useAppDispatch();

  React.useEffect(() => {
    setData(info.data);
  }, [info.data]);

  const handleRevert = React.useCallback(() => {
    setData(info.data);
  }, [info.data]);

  const handleSave = React.useCallback(async () => {
    await invoke.updateTransformer({ item, data: good(data) });
    await dispatch(pullTransformers());
  }, [item, data, dispatch]);

  const handleDelete = React.useCallback(async () => {
    await invoke.deleteTransformer({ item, data: info });
    await dispatch(pullTransformers());
  }, [dispatch, info, item]);

  return (
    <Stack padding={2} width={1} boxSizing="border-box" spacing={2} position="relative">
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography level="h3">Configuration</Typography>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" color="neutral" startDecorator={<SaveRoundedIcon />} onClick={handleSave}>Save</Button>
          <Button variant="outlined" color="neutral" startDecorator={<RestoreRoundedIcon />} onClick={handleRevert}>Revert</Button>
          <IconButton variant='outlined' color="danger" onClick={handleDelete}>
            <DeleteRoundedIcon />
          </IconButton>
        </Stack>
      </Stack>
      <AccordionGroup disableDivider size="lg">
        <SourceOptions data={data} setData={setData} />
        <RebateDataOptions data={data} setData={setData} />
        <TuneOptions data={data} setData={setData} />
      </AccordionGroup>
    </Stack>
  );
}

/** ------------------------------------------------------------------------- */

export default React.memo(AdvancedTransformerEdit);