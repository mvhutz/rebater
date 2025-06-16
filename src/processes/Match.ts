import z from 'zod/v4';
import { makeBasicRegistration } from './Base';
import { ETL } from '../../types';
import assert from 'assert';

/** ------------------------------------------------------------------------- */

const AttributesSchema = z.object({
  regex: z.string(),
  gather: z.union([z.literal("first"), z.literal("all")]).default('first')
});

type Attributes = z.infer<typeof AttributesSchema>;

async function runProcess(attributes: Attributes, data: ETL.Cell[][]): Promise<ETL.Cell[]> {
  const { regex: _r, gather } = attributes;
  const regex = new RegExp(_r, 'gm');

  return data.flat(1).map(cell => {
    const matches = [...cell.data.matchAll(regex)].map(r => r[1]);
    assert.ok(matches.length > 0, `Could not execute group /${_r}/ for ${cell.data}.`);
    if (gather === "first") {
      return { ...cell, data: matches[0] }
    } else {
      return { ...cell, data: matches.join('') }
    }
  });
}

const Match = makeBasicRegistration<Attributes, ETL.Cell, ETL.Cell>({
  name: "match",
  schema: AttributesSchema,
  types: ["cell"],
  act: runProcess
});

/** ------------------------------------------------------------------------- */

export default Match;
