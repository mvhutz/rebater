import * as XLSX from 'xlsx';
import { makeBasicRegistration } from './Base';

/** ------------------------------------------------------------------------- */

async function runProcess(_: ETL.Action, data: ETL.File[][]): Promise<ETL.Workbook[]> {
  const result = data.flat(1).map(file => {
    const workbook = XLSX.readFile(file.path);
    return { type: "workbook", workbook: workbook, labels: file.labels }; 
  }) satisfies ETL.Workbook[];

  return result;
}

const Excel = makeBasicRegistration<object, ETL.File, ETL.Workbook>({
  name: "excel",
  types: ["file"],
  act: runProcess
});

/** ------------------------------------------------------------------------- */

export default Excel;
