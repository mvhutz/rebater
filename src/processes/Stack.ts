import z from 'zod/v4';
import { makeBasicRegistration } from './Base';
import { ETL } from '../../types';
import assert from 'assert';

/** ------------------------------------------------------------------------- */

const AttributesSchema = z.object({ });
type Attributes = z.infer<typeof AttributesSchema>;

async function runProcess(_: Attributes, data: ETL.Row[][]): Promise<ETL.Table[]> {
  const group = data.flat(1);

  const lengths = group.map(g => g.data.length);
  assert.ok(lengths.every(l => l === lengths[0]), "Not all lengths are equal!");

  return [{
    type: "table",
    data: group.map(r => r.data),
    table: "",
    labels: new Set(),
  }];
}

const Stack = makeBasicRegistration<Attributes, ETL.Row, ETL.Table>({
  name: "stack",
  schema: AttributesSchema,
  types: ["row"],
  act: runProcess
});

/** ------------------------------------------------------------------------- */

export default Stack;
