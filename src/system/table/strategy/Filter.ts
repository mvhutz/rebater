import { z } from "zod/v4";
import { makeNodeElementSchema, NodeElementSchema } from "../../xml";
import { TableTransformation } from ".";
import { RowTransformation } from "../../../system/row";
import { rewire } from "../../util";

/** ------------------------------------------------------------------------- */

const getSchema = () => makeNodeElementSchema(
  z.literal("filter"),
  z.undefined(),
  z.array(NodeElementSchema)
)

type Schema = z.infer<ReturnType<typeof getSchema>>;

/** ------------------------------------------------------------------------- */

export const Filter = {
  name: "filter",
  getSchema,

  async run(table, { state, transformation: { children } }) {
    const criteria = z.array(RowTransformation.getSchema()).parse(children);

    const rows = new Array<Row>();
    for (const row of table.data) {
      const value = await RowTransformation.runMany(criteria, { row, state });
      if (value === "true") rows.push(row);
    }

    return rewire({ ...table, data: rows });
  },

} satisfies TableTransformation<Schema>;
