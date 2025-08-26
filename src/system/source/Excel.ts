import { z } from "zod/v4";
import * as XLSX from "xlsx";
import assert from "assert";
import { SourceInput, SourceOperator } from ".";
import path from "path";
import { Row, Table } from "../information/Table";
import { ExcelSourceData } from "../../shared/transformer/advanced";

/** ------------------------------------------------------------------------- */

/**
 * Extracts tables as sheets from an Excel file.
 */
export class ExcelSourceOperator implements SourceOperator {
  /** The group of sources the extract from. */
  private group: string;
  /** The name of the files to extract. Supports glob. */
  private file: string;
  /** The names of the sheets to extract. Supports regex. */
  private sheets: string[];

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
  private extractWorkSheet(sheet: XLSX.WorkSheet, filepath: string, results: Table[]) {
    const unclean = XLSX.utils.sheet_to_json(sheet, {
      raw: true,
      blankrows: false,
      defval: '',
      header: 1,
    });

    const parsed = z.array(z.array(z.coerce.string())).parse(unclean);
    const rows = parsed.map(r => new Row(r, filepath));
    const table = Table.join(...rows);

    results.push(table);
  }

  /**
   * Extract a table from an Excel workbook.
   * @param workbook The workbook to extract from.
   * @param filepath The path of the file.
   * @param results The table list to push to.
   */
  private extractWorkBook(workbook: XLSX.WorkBook, filepath: string, results: Table[]) {
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

    for (const sheetName of sheetsToTake) {
      const sheet = workbook.Sheets[sheetName];
      const props = workbook.Workbook?.Sheets?.find(p => p.name === sheetName);
      if (props?.Hidden) continue;
      assert.ok(sheet != null, `Sheet '${sheetName}' does not exist on workbook!`);

      this.extractWorkSheet(sheet, filepath, results);
    }
  }

  run(input: SourceInput): Table[] {
    // Get the needed files.
    const glob = input.state.settings.getSourcePathGlob(this.group, this.file, ".xls*");
    const files = input.state.sources.filter(s => path.matchesGlob(s.path, glob));
    
    // Extract tables.
    const results = new Array<Table>();
    for (const file of files) {
      const raw = file.getData();
      assert.ok(raw != null, `Source file '${file.path}' not loaded!`);

      const workbook = XLSX.read(raw, { type: "buffer" });
      this.extractWorkBook(workbook, file.path, results);
    }

    return results;
  }
}
