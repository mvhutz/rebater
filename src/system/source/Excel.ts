import { z } from "zod/v4";
import * as XLSX from "xlsx";
import assert from "assert";
import { makeTable } from "../util";
import { BaseSource } from ".";
import { Runner } from "../runner/Runner";
import path from "path";

import { XMLElement } from "xmlbuilder";
import { makeNodeElementSchema } from "../xml";

/** ------------------------------------------------------------------------- */

/**
 * Extracts tables as sheets from an Excel file.
 */
export class ExcelSource implements BaseSource {
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
  public constructor(group: string, file: string, sheets: string[]) {
    this.group = group;
    this.file = file;
    this.sheets = sheets;
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

    const table = makeTable(parsed, filepath);
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
      assert.ok(sheet != null, `Sheet '${sheetName}' does not exist on workbook!`);

      this.extractWorkSheet(sheet, filepath, results);
    }
  }

  run(runner: Runner): Table[] {
    // Get the needed files.
    const glob = runner.settings.getSourcePathGlob(this.group, this.file, ".xls*");
    const files = runner.sources.filter(s => path.matchesGlob(s.path, glob));

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

  public static readonly SCHEMA = z.strictObject({
    type: z.literal("excel"),
    group: z.string(),
    file: z.string().default("*"),
    sheets: z.array(z.string()).default([]),
  }).transform(s => new ExcelSource(s.group, s.file, s.sheets));

  buildXML(from: XMLElement): void {
    from.element("excel", {
      group: this.group,
      file: this.file,
      sheets: this.sheets?.join(",")
    });
  }

  public static readonly XML_SCHEMA = makeNodeElementSchema("excel",
    z.strictObject({
      group: z.string(),
      file: z.string().default("*"),
      sheets: z.string().default("").transform(s => s.split(",").filter(Boolean))
    }),
    z.undefined())
    .transform(({ attributes: a }) => new ExcelSource(a.group, a.file, a.sheets))
}
