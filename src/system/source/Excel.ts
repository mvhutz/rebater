import { z } from "zod/v4";
import * as XLSX from "xlsx";
import assert from "assert";
import { SourceInput, SourceOperator } from ".";
import path from "path";
import { Row, Table } from "../information/Table";
import { ExcelSourceData } from "../../shared/transformer/advanced";
import { slugify } from "../util";

/** ------------------------------------------------------------------------- */

/**
 * Extracts tables as sheets from an Excel file.
 */
export class ExcelSourceOperator implements SourceOperator {
  /** The group of sources the extract from. */
  private readonly group: string;
  /** The name of the files to extract. Supports glob. */
  private readonly file: string;
  /** The names of the sheets to extract. Supports regex. */
  private readonly sheets: string[];

  private static readonly VALID_EXTENSIONS = new Set(['.xlm', '.xls', '.xlsm', '.xlsx', '.xlt', '.xltm', '.xltx']);
  /**
   * Create an Excel source operation.
   * @param group The group of sources the extract from.
   * @param file The name of the files to extract. Supports glob.
   * @param sheets The names of the sheets to extract. Supports regex.
   */
  public constructor(input: ExcelSourceData) {
    this.group = input.group;
    this.file = input.file;
    this.sheets = input.sheets;
  }

  /**
   * Extract a table from an Excel worksheet.
   * @param sheet The sheet to extract from.
   * @param filepath The path of the file.
   * @param results The table list to push to.
   */
  private extractWorkSheet(sheet: XLSX.WorkSheet, name: string, filepath: string, input: SourceInput): Table[] {
    const unclean = XLSX.utils.sheet_to_json(sheet, {
      raw: true,
      blankrows: false,
      defval: '',
      header: 1,
    });

    const parsed = z.array(z.array(z.coerce.string())).parse(unclean);
    const rows = parsed.map(r => new Row(r, filepath));
    const table = Table.join(rows, { group: this.group, file: filepath, sheet: name });

    if (table.size() === 0) {
      input.stats.issues.empty_sheet.push({
        transformer: input.transformer,
        group: this.group,
        source: filepath,
        sheet: name
      });

      return [];
    }

    return [table];
  }

  /**
   * Extract a table from an Excel workbook.
   * @param workbook The workbook to extract from.
   * @param filepath The path of the file.
   * @param results The table list to push to.
   */
  private extractWorkBook(workbook: XLSX.WorkBook, filepath: string, input: SourceInput): Table[] {
    const sheetsToTake = new Set<string>();
    if (this.sheets.length == 0) {
      workbook.SheetNames.forEach(m => sheetsToTake.add(m));
    } else {
      for (const sheet of this.sheets) {
        const regex = new RegExp(`^${sheet}$`);
        const matching = workbook.SheetNames.filter(n => regex.test(n));
        matching.forEach(m => sheetsToTake.add(m));
      }
    }

    const results = [];

    for (const sheetName of sheetsToTake) {
      const sheet = workbook.Sheets[sheetName];
      const props = workbook.Workbook?.Sheets?.find(p => p.name === sheetName);
      if (props?.Hidden !== 0) continue;
      
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      assert.ok(sheet != null, `Cannot find sheet '${sheetName}' in workbook!`);

      results.push(...this.extractWorkSheet(sheet, sheetName, filepath, input));
    }

    if (results.length === 0) {
      input.stats.issues.empty_source.push({
        transformer: input.transformer,
        group: this.group,
        source: filepath
      });
    }

    return results;
  }

  getPotentialSources(input: SourceInput): unknown[] {
    const files = input.state.sources.getEntries()
      .filter(e => e.item.group === this.group
        && input.context.time.is(e.item.quarter));
    
    return files.toArray();
  }

  run(input: SourceInput): Table[] {
    // Get the needed files.
    const files = input.state.sources.getEntries()
      .filter(e =>
        e.item.group === this.group
          && input.context.time.is(e.item.quarter)
          && ExcelSourceOperator.VALID_EXTENSIONS.has(path.extname(e.item.name))
          && path.matchesGlob(slugify(e.item.name), slugify(this.file)));
    
    // Extract tables.
    const results = [];

    for (const file of files) {
      const { data: source } = file;
      assert.ok(source.ok, `Source file '${file.item.name}' is invalid: '${source.ok ? "Unknown" : source.reason}'`);

      const workbook = XLSX.read(source.data, { type: "buffer" });
      results.push(...this.extractWorkBook(workbook, file.item.name, input));
    }

    return results;
  }
}
