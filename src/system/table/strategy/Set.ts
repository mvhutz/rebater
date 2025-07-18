import { z } from "zod/v4";
import { makeNodeElementSchema, NodeElementSchema } from "../../xml";
import { TableTransformation } from ".";
import { RowTransformation } from "../../../system/row";
import { ExcelIndexSchema } from "../../util";

/** ------------------------------------------------------------------------- */

const getSchema = () => makeNodeElementSchema(
  z.literal("set"),
  z.strictObject({
    column: ExcelIndexSchema,
  }),
  z.array(NodeElementSchema)
)

type Schema = z.infer<ReturnType<typeof getSchema>>;

/** ------------------------------------------------------------------------- */

export const Set = {
  name: "set",
  getSchema,

  async run(table, { state, transformation: { children, attributes: { column } } }) {
    const to = z.array(RowTransformation.getSchema()).parse(children);

    for (const row of table.data) {
      row.data[column] = await RowTransformation.runMany(to, { row, state });
    }

    return table;
  },

} satisfies TableTransformation<Schema>;
