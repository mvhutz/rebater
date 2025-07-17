import { z } from "zod/v4";
import { RowTransformation as RowTransformationType } from ".";
import { makeNodeElementSchema, TextElementSchema } from "../../../system/xml";

/** ------------------------------------------------------------------------- */

const getSchema = () => makeNodeElementSchema(
  z.literal("literal"),
  z.never(),
  z.array(TextElementSchema).length(1)
);

type Schema = z.infer<ReturnType<typeof getSchema>>;

/** ------------------------------------------------------------------------- */

export const Literal: RowTransformationType<Schema> = {
  name: "literal",
  getSchema,

  async run(_, { transformation: { children } }) {
    return children[0].text;
  }
};
