import { z } from "zod/v4";
import { ExcelIndexSchema, makeTable } from "../../util";
import { makeNodeElementSchema } from "../../xml";
import { TableTransformation } from ".";

/** ------------------------------------------------------------------------- */

const getSchema = () => makeNodeElementSchema(
  z.literal("percolate"),
  z.strictObject({
    columns: z.string()
          .transform(v => z.array(ExcelIndexSchema).parse(JSON.parse(v))),
    matches: z.string().default('[""]')
      .transform(v => z.array(z.string()).parse(JSON.parse(v)))
  }),
  z.never(),
)

type Schema = z.infer<ReturnType<typeof getSchema>>;

/** ------------------------------------------------------------------------- */

export const Percolate = {
  name: "percolate",
  getSchema,

  async run(table, { transformation: { attributes: { columns, matches } } }) {
    let previous: Maybe<string[]>;
    const rows = new Array<string[]>();

    for (const row of table.data) {
      const cells = [...row.data];

      for (const index of columns) {
        if (matches.includes(cells[index])) {
          if (previous == null) continue;
          cells[index] = previous[index];
        }
      }

      previous = cells;
      rows.push(cells);
    }

    return makeTable(rows, table.path);
  },
} satisfies TableTransformation<Schema>;
