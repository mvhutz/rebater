import { z } from "zod/v4";
import { makeNodeElementSchema } from "../../xml";
import { TableTransformation } from ".";

/** ------------------------------------------------------------------------- */

const getSchema = () => makeNodeElementSchema(
  z.literal("trim"),
  z.strictObject({
    top: z.coerce.number().optional(),
    bottom: z.coerce.number().optional(),
  }),
  z.never()
)

type Schema = z.infer<ReturnType<typeof getSchema>>;
/** ------------------------------------------------------------------------- */

export const Trim = {
  name: "trim",
  getSchema,

  async run(table, { transformation: { attributes: { top, bottom } } }) {
    table.data = table.data.slice(top == null ? undefined : top, bottom == null ? undefined : -bottom);
    return table;
  },

} satisfies TableTransformation<Schema>;
