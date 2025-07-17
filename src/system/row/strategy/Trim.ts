import { z } from "zod/v4";
import { RowTransformation as RowTransformationType } from ".";
import { makeNodeElementSchema } from "../../../system/xml";

/** ------------------------------------------------------------------------- */

const getSchema = () => makeNodeElementSchema(
  z.literal("trim"),
  z.never(),
  z.never()
);

type Schema = z.infer<ReturnType<typeof getSchema>>;

/** ------------------------------------------------------------------------- */

export const Trim: RowTransformationType<Schema> = {
  name: "trim",
  getSchema,

  async run(value) { return value.trim(); }
};
