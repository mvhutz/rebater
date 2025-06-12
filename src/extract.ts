import path from "path";
import { ExcelSource, ParserContext, PDFSource, Rebate, RebateSchema, Source, SourceDataSchema, SourceFile, Supplier } from "./schema";
import { glob, readFile, writeFile } from "fs/promises";
import XSLX from 'xlsx';
import Tabula from 'tabula-js';
import { z } from 'zod/v4';
import Papa from 'papaparse';
import { loadSupplier, parseSourceFile } from "./parser";
import { getCustomersFile } from "./customers";

async function extractExcel(source: ExcelSource, path: string): Promise<SourceFile[]> {
  const workbook = XSLX.readFile(path);
  const sheets = new Array<XSLX.WorkSheet>();

  if (source.sheets == null) {
    sheets.push(...Object.values(workbook.Sheets));
  } else {
    for (const sheet of source.sheets) {
      if (!workbook.SheetNames.includes(sheet)) {
        throw Error(`Workbook '${path}' does not include sheet '${sheet}'.`);
      }

      sheets.push(workbook.Sheets[sheet]);
    }
  }

  return await Promise.all(sheets.map(async s => {
    const uncleanData = XSLX.utils.sheet_to_json(s, {
      header: 1,
      raw: false,
      blankrows: false,
      defval: '',
    });

    const data = await SourceDataSchema.parseAsync(uncleanData);
    return { source: source.name, path, data };
  }))
}

async function promisifyTabula(path: string, options?: object): Promise<unknown> {
  const pdf = Tabula(path, options);
  return new Promise((res, rej) => {
    pdf.extractCsv((err: unknown, data: unknown) => {
      if (err) rej(err);
      res(data);
    });
  })
}

async function extractPDF(source: PDFSource, path: string): Promise<SourceFile[]> {
  const tabulata = await promisifyTabula(path, {
      pages: source.pages?.join() ?? "all",
    });

    const parsedTabulata = await z.array(z.string()).parseAsync(tabulata);
    const csv = parsedTabulata.join("\n");
    const { data } = Papa.parse(csv);
    const parsedData = await SourceDataSchema.parseAsync(data);

    return [{
      source: source.name,
      path: path,
      data: parsedData,
    }];
}

async function extractSource(source: Source, path: string): Promise<SourceFile[]> {
  let sourceFiles: SourceFile[];
  switch (source.type) {
    case "excel":
      sourceFiles = await extractExcel(source, path);
      break;
    case "pdf":
      sourceFiles = await extractPDF(source, path);
      break;
  }

  if (source.rows != null) {
    const { from, to } = source.rows;
    sourceFiles.forEach(file => {
      file.data = file.data.slice(from ?? 0, to ?? -1);
    })
  }

  return sourceFiles;
}

interface FetchSupplierOptions {
  directory: string;
  quarter: 1 | 2 | 3 | 4;
  year: number;
}

export async function fetchSources(supplier: Supplier, options: FetchSupplierOptions): Promise<SourceFile[]> {
  const combinedPath = path.join(
    options.directory,
    supplier.name,
    options.year.toString(),
    `Q${options.quarter}`);

  const results = new Array<SourceFile>();

  for (const source of supplier.sources) {
    const totalPath = path.join(combinedPath, source.path);
    
    for await (const sourceFile of glob(totalPath)) {
      results.push(...await extractSource(source, sourceFile));
    }
  }

  return results;
}

export async function prepareRebates(path: string) {
  const file = await readFile(path, 'utf-8');
  const { data } = Papa.parse(file, { header: true, dynamicTyping: true });
  return z.array(RebateSchema).parse(data);

}

export async function compareRebate(file1: string, file2: string) {
  const rebates1 = await prepareRebates(file1);
  const rebates2 = await prepareRebates(file2);

  const rows1 = rebates1.map(r => {
    const deleted: Partial<Rebate> = { ...r };
    delete deleted.purchaseId;
    return Object.values(deleted).join();
  });

  const rows2 = rebates2.map(r => {
    const deleted: Partial<Rebate> = { ...r };
    delete deleted.purchaseId;
    return Object.values(deleted).join();
  });

  for (const row of rows1) {
    if (!rows2.includes(row)) {
      console.log(`'${file2}' needs '${row}'`);
    }
  }

  for (const row of rows2) {
    if (!rows1.includes(row)) {
      console.log(`'${file1}' needs '${row}'`);
    }
  }
}

export async function fetchRebates(supplierPath: string, customerPath: string, resultPath: string): Promise<Rebate[]> {
  const supplier = await loadSupplier(supplierPath);
  const files = await fetchSources(supplier, {
    directory: "data",
    quarter: 4,
    year: 2024
  });

  const context: ParserContext = {
    customers: await getCustomersFile(customerPath),
    counters: {},
  };

  const rebates = new Array<Rebate>();

  for (const file of files) {
    const parsed = await parseSourceFile(file, context, supplier);
    rebates.push(...parsed);
  }

  await writeFile(resultPath, Papa.unparse(rebates))
  return rebates;
}
