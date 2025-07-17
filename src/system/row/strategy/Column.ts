import { z } from "zod/v4";
import { RowTransformation as RowTransformationType } from ".";
import { makeNodeElementSchema } from "../../../system/xml";
import { ExcelIndexSchema } from "../../../system/util";

/** ------------------------------------------------------------------------- */

const getSchema = () => makeNodeElementSchema(
  z.literal("column"),
  z.strictObject({
    index: ExcelIndexSchema,
  }),
  z.never()
);

type Schema = z.infer<ReturnType<typeof getSchema>>;

/** ------------------------------------------------------------------------- */

export const Add: RowTransformationType<Schema> = {
  name: "column",
  getSchema,

  async run(_, { row, transformation: { attributes: { index } } }) {
    return row.data[index];
  }
};
