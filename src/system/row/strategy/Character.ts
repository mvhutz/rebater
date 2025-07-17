import { z } from "zod/v4";
import { RowTransformation as RowTransformationType } from ".";
import { makeNodeElementSchema } from "../../../system/xml";

/** ------------------------------------------------------------------------- */

function getSchema() {
  return makeNodeElementSchema(
    z.literal("character"),
    z.strictObject({
      select: z.string(),
      action: z.union([z.literal("keep"), z.literal("drop")]).default("keep")
    }),
    z.never()
  );
}

type Schema = z.infer<ReturnType<typeof getSchema>>;

/** ------------------------------------------------------------------------- */

export const Character: RowTransformationType<Schema> = {
  name: "character",
  getSchema,

  async run(value, { transformation: { attributes: { select, action } } }) {
    return value
      .split("")
      .filter(c => select.includes(c) === (action === "keep"))
      .join("");
  }
};
