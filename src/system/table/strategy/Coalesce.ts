import { z } from "zod/v4";
import { ExcelIndexSchema, rewire } from "../../util";
import { makeNodeElementSchema } from "../../xml";
import { TableTransformation } from ".";
import assert from "assert";

/** ------------------------------------------------------------------------- */

const getSchema = () => makeNodeElementSchema(
  z.literal("coalesce"),
  z.strictObject({
    match: z.string()
      .transform(v => z.array(ExcelIndexSchema).parse(JSON.parse(v))),
    combine: z.string().default("[]")
      .transform(v => z.array(ExcelIndexSchema).parse(JSON.parse(v)))
  }),
  z.undefined(),
)

type Schema = z.infer<ReturnType<typeof getSchema>>;

/** ------------------------------------------------------------------------- */

function getHash(row: Row, matches: number[]) {
  const array = matches.map(m => row.data[m]);
  return JSON.stringify(array);
}

function combineRows(indices: number[], rows: Row[]) {
  const result = structuredClone(rows.pop());
  assert.ok(result != null, "Cannot coalesce empty set of arrays.");

  for (const row of rows) {
    for (const index of indices) {
      result.data[index] = (Number(row.data[index]) + Number(result.data[index])).toString()
    }
  }

  return result;
}

export const Coalesce = {
  name: "coalesce",
  getSchema,
  async run(table, { transformation: { attributes: { match, combine } } }) {
    const matched = new Map<string, Row[]>();
    for (const row of table.data) {
      const hash = getHash(row, match);
      const list = matched.get(hash);

      if (list == null) {
        matched.set(hash, [row]);
      } else {
        list.push(row);
      }
    }

    const combined = [...matched.values()].map(combineRows.bind(null, combine));
    return rewire({ ...table, data: combined });
  },
} satisfies TableTransformation<Schema>;
