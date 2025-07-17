import { z } from "zod/v4";
import { RowTransformation as RowTransformationType } from ".";
import { makeNodeElementSchema, NodeElementSchema } from "../../../system/xml";
import { RowTransformation } from "..";

/** ------------------------------------------------------------------------- */

const getSchema = () => makeNodeElementSchema(
  z.literal("concat"),
  z.strictObject({
    separator: z.string().default("")
  }),
  z.array(NodeElementSchema)
);

type Schema = z.infer<ReturnType<typeof getSchema>>;

/** ------------------------------------------------------------------------- */

export const Concat: RowTransformationType<Schema> = {
  name: "concat",
  getSchema,

  async run(value, options) {
    const { transformation: { children, attributes: { separator } } } = options;
    const extra = z.array(RowTransformation.getSchema()).parse(children);
    const extra_value = await RowTransformation.runMany(extra, options);
    return [value, extra_value].join(separator);
  }
};
