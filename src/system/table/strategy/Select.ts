import { z } from "zod/v4";
import { ExcelIndexSchema, rewire } from "../../util";
import { makeNodeElementSchema } from "../../xml";
import { TableTransformation } from ".";

/** ------------------------------------------------------------------------- */

const getSchema = () => makeNodeElementSchema(
  z.literal("select"),
  z.strictObject({
    column: ExcelIndexSchema,
    is: z.string()
      .transform(v => z.array(z.string()).parse(JSON.parse(v))),
    isnt: z.string()
      .transform(v => z.array(z.string()).parse(JSON.parse(v))),
    action: z.union([z.literal("drop"), z.literal("keep")]).default("keep"),
  }),
  z.undefined(),
)

type Schema = z.infer<ReturnType<typeof getSchema>>;

/** ------------------------------------------------------------------------- */

export const Select = {
  name: "select",
  getSchema,
  async run(table, { transformation: { attributes: { column, is, isnt, action } } }) {
    const trueIs = is == null || Array.isArray(is) ? is : [is];
    const trueIsnt = isnt == null || Array.isArray(isnt) ? isnt : [isnt];

    const rows = table.data.filter(row => {
      const datum = row.data[column];
      return (action === "keep") === (trueIs?.includes(datum) || (trueIsnt != null && !trueIsnt.includes(datum)));
    });

    return rewire({ ...table, data: rows });
  },
} satisfies TableTransformation<Schema>;
