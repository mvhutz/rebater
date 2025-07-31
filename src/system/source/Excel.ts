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

export class ExcelSource implements BaseSource {
  public static readonly SCHEMA = z.strictObject({
    type: z.literal("excel"),
    group: z.string(),
    file: z.string().default("*"),
    sheets: z.array(z.string()).default([]),
  }).transform(s => new ExcelSource(s.group, s.file, s.sheets));

  private group: string;
  private file: string;
  private sheets: string[];

  public constructor(group: string, file: string, sheets: string[]) {
    this.group = group;
    this.file = file;
    this.sheets = sheets;
  }

  private getSourceFileGlob(runner: Runner) {
    return runner.settings.getSourcePathGlob(this.group, this.file, ".xls*");
  }

  run(runner: Runner): Table[] {
    const glob = this.getSourceFileGlob(runner);
    const files = runner.sources.filter(s => path.matchesGlob(s.path, glob));
    const results = new Array<Table>();

    for (const file of files) {
      const raw = file.getData();
      assert.ok(raw != null, `Source file '${file.path}' not loaded!`);

      const workbook = XLSX.read(raw, { type: "buffer" });

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

        const unclean = XLSX.utils.sheet_to_json(sheet, {
          raw: true,
          blankrows: false,
          defval: '',
          header: 1,
        });

        const parsed = z.array(z.array(z.coerce.string())).parse(unclean);

        const table = makeTable(parsed, file.path);
        results.push(table);
      }
    }

    return results;
  }

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
