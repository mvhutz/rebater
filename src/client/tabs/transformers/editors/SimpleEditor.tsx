import React, { useContext } from 'react';
import Stack from '@mui/joy/Stack';
import Typography from '@mui/joy/Typography';
import { FormControl, FormLabel, AccordionSummary, AccordionGroup, Accordion, AccordionDetails, FormHelperText, Input, Switch, Textarea, Card, Option, Select, Sheet, Tooltip, Box } from '@mui/joy';
import MultiSelect from '../../MultiSelect';
import { Draft, produce } from 'immer';
import { SimpleDraft2Transformer, SimpleTransformerDraft } from '../../../store/slices/drafts';
import { useAppDispatch } from '../../../store/hooks';
import { updateTransformerDraft } from '../../../store/slices/system';
import { $ZodIssue } from 'zod/v4/core';
import { doesArrayStartWith } from '../../../../shared/util';
import HelpOutlineRoundedIcon from '@mui/icons-material/HelpOutlineRounded';

/** ------------------------------------------------------------------------- */

const SimpleContext = React.createContext<[
  SimpleTransformerDraft,
  (fn: (state: Draft<SimpleTransformerDraft>) => void) => void,
  $ZodIssue[]
]>([null as unknown as SimpleTransformerDraft, fn => { void fn; }, []])

/** ------------------------------------------------------------------------- */

interface HandledInputProps {
  tooltip?: React.ReactNode;
  placeholder?: string;
  header: string;
  issue_path: PropertyKey[];
  value: string;
  updater: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, state: Draft<SimpleTransformerDraft>) => void;
}

function HandledInput(props: HandledInputProps) {
  const { header, tooltip, updater, value, placeholder, issue_path } = props;
  const [, setData, issues] = useContext(SimpleContext);
  const issue = issues.find(i => doesArrayStartWith(i.path, issue_path));

  const handleColumn = React.useCallback<React.ChangeEventHandler<HTMLInputElement>>(e => {
    setData(d => { updater(e, d) });
  }, [setData, updater]);

  return (
    <FormControl error={issue != null} sx={{ flex: 1 }}>
      <FormLabel>
        {header}
        {tooltip != null &&
          <Tooltip variant='outlined' title={<Box maxWidth={300}>{tooltip}</Box>}>
            <HelpOutlineRoundedIcon fontSize='small' />
          </Tooltip>
        }
      </FormLabel>
      <Input variant='soft' value={value} onChange={handleColumn} placeholder={placeholder} />
      {issue && <FormHelperText>{issue.message}</FormHelperText>}
    </FormControl>
  )
}

function HandledTextArea(props: HandledInputProps) {
  const { header, tooltip, updater, value, placeholder, issue_path } = props;
  const [, setData, issues] = useContext(SimpleContext);
  const issue = issues.find(i => doesArrayStartWith(i.path, issue_path));

  const handleValue = React.useCallback<React.ChangeEventHandler<HTMLTextAreaElement>>(e => {
    setData(d => { updater(e, d) });
  }, [setData, updater]);

  return (
    <FormControl error={issue != null}>
      <FormLabel>
        {header}
        {tooltip != null &&
          <Tooltip variant='outlined' title={<Box maxWidth={300}>{tooltip}</Box>}>
            <HelpOutlineRoundedIcon fontSize='small' />
          </Tooltip>
        }
      </FormLabel>
      <Textarea variant='soft' minRows={2} value={value} onChange={handleValue} sx={{ fontFamily: "monospace" }} size='sm' placeholder={placeholder} />
      {issue && <FormHelperText>{issue.message}</FormHelperText>}
    </FormControl>
  )
}

/** ------------------------------------------------------------------------- */

function SourceOptions() {
  const [data, setData] = useContext(SimpleContext);
  const { source: { file, sheets, trim: { top, bottom } } } = data;

  const handleSheets = React.useCallback((v: string[]) => {
    setData(d => { d.source.sheets = v; });
  }, [setData]);

  const file_path = ["source", "file"];
  const top_path = ["source", "trim", "top"];
  const bottom_path = ["source", "trim", "bottom"];
  const handleFile: HandledInputProps["updater"] = (e, d) => { d.source.file = e.target.value; };
  const handleTop: HandledInputProps["updater"] = (e, d) => { d.source.trim.top = e.target.value; };
  const handleBottom: HandledInputProps["updater"] = (e, d) => { d.source.trim.bottom = e.target.value; };

  return (
    <Accordion>
      <AccordionSummary>
        <Typography>
          Sources
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Stack spacing={3} mt={2}>
          <HandledInput header="File Name" issue_path={file_path} value={file} updater={handleFile} tooltip="Filter only specific files in the source group, by file name. Glob expressions are supported." />
          <FormControl sx={{ flex: 1 }}>
            <FormLabel>Sheets</FormLabel>
            <MultiSelect placeholder="Input sheet names..." values={sheets} onValues={handleSheets} />
            <FormHelperText>In each file, filter out which sheets should be considered. Supports regular expressions.</FormHelperText>
          </FormControl>
          <Stack direction="row" spacing={2}>
            <HandledInput header="Trim Header" issue_path={top_path} value={top} updater={handleTop} tooltip="Trim top rows off each sheet." />
            <HandledInput header="Trim Footer" issue_path={bottom_path} value={bottom} updater={handleBottom} tooltip="Trim bottom rows off each sheet." />
          </Stack>
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
}

function TuneOptions() {
  const [data, setData] = useContext(SimpleContext);
  const { options: { canadian_rebate, remove_null_rebates, additional_preprocessing, additional_postprocessing } } = data;

  const pre_path = ["options", "additional_preprocessing"];
  const post_path = ["options", "additional_postprocessing"];
  const handlePre: HandledInputProps["updater"] = (e, d) => { d.options.additional_preprocessing = e.target.value; };
  const handlePost: HandledInputProps["updater"] = (e, d) => { d.options.additional_postprocessing = e.target.value; };

  const handleCanadian = React.useCallback<React.ChangeEventHandler<HTMLInputElement>>(e => {
    setData(d => { d.options.canadian_rebate = e.target.checked; });
  }, [setData]);

  const handleNull = React.useCallback<React.ChangeEventHandler<HTMLInputElement>>(e => {
    setData(d => { d.options.remove_null_rebates = e.target.checked; });
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
              <Switch checked={canadian_rebate} onChange={handleCanadian} size='sm' />
            </Stack>
            <FormHelperText>Select this property if this source group contains Canadian data.</FormHelperText>
          </FormControl>
          <FormControl>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <FormLabel>Remove Null Rebates</FormLabel>
              <Switch checked={remove_null_rebates} onChange={handleNull} size='sm' />
            </Stack>
            <FormHelperText>Get rid of all rebates that have $0.00 as its rebate amount.</FormHelperText>
          </FormControl>
          <HandledTextArea header="Additional Pre-processing" issue_path={pre_path} value={additional_preprocessing} updater={handlePre} tooltip="Add additional operations before the rebate data is extracted. Input is JSON." />
          <HandledTextArea header="Additional Post-processing" issue_path={post_path} value={additional_postprocessing} updater={handlePost} tooltip="Add additional operations after the rebate data is extracted. Input is JSON." />
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
}

function TransactionDateOptions() {
  const [data] = useContext(SimpleContext);
  const { column, parse } = data.properties.transactionDate;

  const column_path = ["properties", "transactionDate", "column"];
  const parse_path = ["properties", "transactionDate", "parse"];
  const handleColumn: HandledInputProps["updater"] = (e, d) => { d.properties.transactionDate.column = e.target.value; };
  const handleParse: HandledInputProps["updater"] = (e, d) => { d.properties.transactionDate.parse = e.target.value; };

  return (
    <Card orientation="horizontal" size='sm'>
      <Typography level="title-lg" flex={1}>Transaction Date</Typography>
      <Stack spacing={2} flex={1}>
        <HandledInput header="Column" placeholder='AA' issue_path={column_path} value={column} updater={handleColumn} />
        <HandledInput header="Date Format" placeholder="M/D/YYYY" issue_path={parse_path} value={parse} updater={handleParse} tooltip={<>
          Optional. Most common formats are automatically parsed. Formats are defined <a href="https://momentjscom.readthedocs.io/en/latest/moment/04-displaying/01-format">here</a>.
        </>} />
      </Stack>
    </Card>
  );
}

function InvoiceDateOptions() {
  const [data] = useContext(SimpleContext);
  const { column, parse } = data.properties.invoiceDate;

  const column_path = ["properties", "invoiceDate", "column"];
  const parse_path = ["properties", "invoiceDate", "parse"];
  const handleColumn: HandledInputProps["updater"] = (e, d) => { d.properties.invoiceDate.column = e.target.value; };
  const handleParse: HandledInputProps["updater"] = (e, d) => { d.properties.invoiceDate.parse = e.target.value; };

  return (
    <Card orientation="horizontal" size='sm'>
      <Typography level="title-lg" flex={1}>Invoice Date</Typography>
      <Stack spacing={2} flex={1}>
        <HandledInput header="Column" placeholder='AA' issue_path={column_path} value={column} updater={handleColumn} />
        <HandledInput header="Date Format" placeholder="M/D/YYYY" issue_path={parse_path} value={parse} updater={handleParse} tooltip={<>
          Optional. Most common formats are automatically parsed. Formats are defined <a href="https://momentjscom.readthedocs.io/en/latest/moment/04-displaying/01-format">here</a>.
        </>} />
      </Stack>
    </Card>
  );
}

function SupplierIdOptions() {
  const [data] = useContext(SimpleContext);
  const { value } = data.properties.supplierId;

  const value_path = ["properties", "supplierId", "value"];
  const handleValue: HandledInputProps["updater"] = (e, d) => { d.properties.supplierId.value = e.target.value; };

  return (
    <Card orientation="horizontal" size='sm'>
      <Typography level="title-lg" flex={1}>Supplier Id</Typography>
      <Stack spacing={2} flex={1}>
        <HandledInput header="Number" placeholder='##' issue_path={value_path} value={value} updater={handleValue} />
      </Stack>
    </Card>
  );
}

function MemberIdOptions() {
  const [data] = useContext(SimpleContext);
  const { column } = data.properties.memberId;

  const value_path = ["properties", "memberId", "column"];
  const handleValue: HandledInputProps["updater"] = (e, d) => { d.properties.memberId.column = e.target.value; };

  return (
    <Card orientation="horizontal" size='sm'>
      <Typography level="title-lg" flex={1}>Member Id</Typography>
      <Stack spacing={2} flex={1}>
        <HandledInput header="Column" placeholder='AA' issue_path={value_path} value={column} updater={handleValue} />
      </Stack>
    </Card>
  );
}

function InvoiceIdOptions() {
  const [data] = useContext(SimpleContext);
  const { column } = data.properties.invoiceId;

  const value_path = ["properties", "invoiceId", "column"];
  const handleValue: HandledInputProps["updater"] = (e, d) => { d.properties.invoiceId.column = e.target.value; };

  return (
    <Card orientation="horizontal" size='sm'>
      <Typography level="title-lg" flex={1}>Invoice Id</Typography>
      <Stack spacing={2} flex={1}>
        <HandledInput header="Column" placeholder='AA' issue_path={value_path} value={column} updater={handleValue} />
      </Stack>
    </Card>
  );
}

function PurchaseAmountOptions() {
  const [data] = useContext(SimpleContext);
  const { column } = data.properties.purchaseAmount;

  const value_path = ["properties", "purchaseAmount", "column"];
  const handleValue: HandledInputProps["updater"] = (e, d) => { d.properties.purchaseAmount.column = e.target.value; };

  return (
    <Card orientation="horizontal" size='sm'>
      <Typography level="title-lg" flex={1}>Purchase Amount</Typography>
      <Stack spacing={2} flex={1}>
        <HandledInput header="Column" placeholder='AA' issue_path={value_path} value={column} updater={handleValue} />
      </Stack>
    </Card>
  );
}

function RebateAmountOptions() {
  const [data] = useContext(SimpleContext);
  const { column, multiplier } = data.properties.rebateAmount;

  const column_path = ["properties", "rebateAmount", "column"];
  const multipler_path = ["properties", "rebateAmount", "multiplier"];
  const handleColumn: HandledInputProps["updater"] = (e, d) => { d.properties.rebateAmount.column = e.target.value; };
  const handleMultipler: HandledInputProps["updater"] = (e, d) => { d.properties.rebateAmount.multiplier = e.target.value; };

  return (
    <Card orientation="horizontal" size='sm'>
      <Typography level="title-lg" flex={1}>Rebate Amount</Typography>
      <Stack spacing={2} flex={1}>
        <HandledInput header="Column" placeholder='AA' issue_path={column_path} value={column} updater={handleColumn} />
        <HandledInput header="Multiplier" placeholder='0.03' issue_path={multipler_path} value={multiplier} updater={handleMultipler} tooltip="Optional. Ignored if left blank." />
      </Stack>
    </Card>
  );
}

function DistributorIdOptions() {
  const [data, setData] = useContext(SimpleContext);
  const { type, value } = data.properties.distributorName;

  const value_path = ["properties", "distributorName", "value"];
  const handleValue: HandledInputProps["updater"] = (e, d) => { d.properties.distributorName.value = e.target.value; };

  const handleType = React.useCallback((_: unknown, c: "name" | "column" | null) => {
    if (c == null) return;
    setData(d => { d.properties.distributorName = { type: c, value: "" }; });
  }, [setData]);

  return (
    <Card orientation="horizontal" size='sm'>
      <Typography level="title-lg" flex={1}>Distributor Id</Typography>
      <Stack spacing={2} flex={1}>
        <FormControl>
          <FormLabel>Type</FormLabel>
          <Select value={type} onChange={handleType} variant='soft'>
            <Option value="name" defaultChecked>Name</Option>
            <Option value="column">Column</Option>
          </Select>
        </FormControl>
        <HandledInput header={type === "column" ? "Column" : "Name"} placeholder={type === "column" ? "##" : "Company..."} issue_path={value_path} value={value} updater={handleValue} />
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

  const issues = React.useMemo(() => {
    const results = SimpleDraft2Transformer.safeDecode(data);
    if (results.success) return [];
    return results.error.issues;
  }, [data]);

  const setData = React.useCallback((fn: (state: Draft<SimpleTransformerDraft>) => void) => {
    dispatch(updateTransformerDraft(produce(fn)(data)));
  }, [data, dispatch]);

  return (
    <SimpleContext.Provider value={[data, setData, issues]}>
      <Stack flex={1} position="relative">
        <Sheet sx={{ overflow: "auto", flex: "1 1 0px", pb: 32 }}>
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