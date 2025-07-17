import { z } from "zod/v4";
import { RowTransformation as RowTransformationType } from ".";
import { makeNodeElementSchema, makeTextElementSchema } from "../../../system/xml";
import { ExcelIndexSchema } from "../../../system/util";

/** ------------------------------------------------------------------------- */

const getSchema = () => makeNodeElementSchema(
  z.literal("column"),
  z.undefined(),
  z.array(makeTextElementSchema(ExcelIndexSchema))
);

type Schema = z.infer<ReturnType<typeof getSchema>>;

/** ------------------------------------------------------------------------- */

export const Column: RowTransformationType<Schema> = {
  name: "column",
  getSchema,

  async run(_, { row, transformation: { children: [{ text }] } }) {
    return row.data[text];
  }
};
