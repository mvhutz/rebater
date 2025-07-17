import { z } from "zod/v4";
import { RowTransformation as RowTransformationType } from ".";
import { makeNodeElementSchema, NodeElementSchema } from "../../../system/xml";
import { RowTransformation } from "..";

/** ------------------------------------------------------------------------- */

const getSchema = () => makeNodeElementSchema(
  z.literal("multiply"),
  z.never(),
  z.array(NodeElementSchema)
);

type Schema = z.infer<ReturnType<typeof getSchema>>;

/** ------------------------------------------------------------------------- */

export const Multiply: RowTransformationType<Schema> = {
  name: "multiply",
  getSchema,

  async run(value, options) {
    const { transformation: { children } } = options;
    const extra = z.array(RowTransformation.getSchema()).parse(children);
    const extra_value = await RowTransformation.runMany(extra, options);
    return (Number(value) / Number(extra_value)).toString();
  }
};
