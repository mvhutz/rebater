import Tabula from 'tabula-js';
import { z } from 'zod';
import Papa from 'papaparse';
import XSLX from 'xlsx';

async function promisifyTabula(path: string): Promise<unknown> {
  const pdf = Tabula(path);
  return new Promise((res, rej) => {
    pdf.extractCsv((err: unknown, data: unknown) => {
      if (err) rej(err);
      res(data);
    }, {
      noSpreadsheet: true,
      pages: "all",
    });
  })
}

export async function fromPDF(path: string): Promise<string[][]> {
  const tabulata = await promisifyTabula(path);
  const parsedTabulata = await z.array(z.string()).parseAsync(tabulata);
  const csv = parsedTabulata.join("\n");
  const { data } = Papa.parse(csv);
  const parsedData = await z.array(z.array(z.string())).parseAsync(data);
  return parsedData;
}

export async function fromExcel(path: string, sheet?: string) {
  const workbook = XSLX.readFile(path);
  let sheetData: XSLX.WorkSheet;

  if (sheet == null) {
    const firstSheetName = Object.keys(workbook.Sheets)[0];
    sheetData = workbook.Sheets[firstSheetName];
  } else {
    if (!(sheet in workbook.Sheets)) {
      throw Error(`Sheet with name '${sheet}' doesn't exist in workbook '${path}'.`);
    }
    sheetData = workbook.Sheets[sheet];
  }

  const data = XSLX.utils.sheet_to_json(sheetData, {
    header: 1,
    raw: false,
    blankrows: false,
    defval: '',
  });

  const parsedData = await z.array(z.array(z.string())).parseAsync(data);
  return parsedData;
}