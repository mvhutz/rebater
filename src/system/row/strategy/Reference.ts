import { z } from "zod/v4";
import { RowTransformation as RowTransformationType } from ".";
import { makeNodeElementSchema } from "../../../system/xml";
import assert from "assert";

/** ------------------------------------------------------------------------- */

const getSchema = () => makeNodeElementSchema(
  z.literal("reference"),
  z.strictObject({
    table: z.string(),
    match: z.string(),
    take: z.string(),
    group: z.string(),
  }),
  z.undefined()
);

type Schema = z.infer<ReturnType<typeof getSchema>>;

/** ------------------------------------------------------------------------- */

function getQuestionFormat(group: string, take: string, table: string, value: string) {
  return `For **\`${group}\`**, what is the **\`${take}\`** of this **\`${table}\`**?\n\n *\`${value}\`*`
}

export const Reference: RowTransformationType<Schema> = {
  name: "reference",
  getSchema,

  async run(value, { transformation: { attributes: { table, group, take, match } }, state }) {
    const reference = await state.getReference(table);

    const release = await state.requestAsk();
    const result = reference.ask(match, value, take, group);
    if (result != null) {
      release();
      return result;
    }
    
    const answer = await state.ask(getQuestionFormat(group, take, table, value));
    assert.ok(answer != null, `Table '${table}' has no item '${value}' for '${match}'.`);
    
    reference.append({ [match]: value, [take]: answer, group: group });

    release();
    return answer;
  }
};
