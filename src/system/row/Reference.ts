import assert from "assert";
import { z } from "zod/v4";
import { State } from "../information/State";

const NAME = "reference";

/** ------------------------------------------------------------------------- */

function getQuestionFormat(group: string, take: string, table: string, value: string) {
  return `For **\`${group}\`**, what is the **\`${take}\`** of this **\`${table}\`**?\n\n *\`${value}\`*`
}

const schema = z.strictObject({
  type: z.literal("reference"),
  table: z.string(),
  match: z.string(),
  take: z.string(),
  group: z.string(),
});

type Transformation = z.infer<typeof schema>;

async function run(transformation: Transformation, value: string, _row: Row, state: State): Promise<string> {
  const { table, match, take, group } = transformation;
  const reference = await state.getReference(transformation.table);

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

/** ------------------------------------------------------------------------- */

const Reference = { schema, run, name: NAME };
export default Reference;
