import z from "zod/v4";
import { ExcelIndexSchema, getTrueIndex } from "../util";

const NAME = "column";

/** ------------------------------------------------------------------------- */

const schema = z.strictObject({
  type: z.literal(NAME),
  index: ExcelIndexSchema,
});

type Transformation = z.infer<typeof schema>;


async function run(transformation: Transformation, value: string, row: Row) {
  return row.data[getTrueIndex(transformation.index)];
}

/** ------------------------------------------------------------------------- */

const Column = { schema, run, name: NAME };
export default Column;