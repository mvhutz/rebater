import z from 'zod/v4';
import { makeBasicRegistration } from './Base';
import { ETL } from '../../types';

/** ------------------------------------------------------------------------- */

const AttributesSchema = z.object({
  into: z.union([z.literal("rows"), z.literal("columns")]).default("rows"),
});

type Attributes = z.infer<typeof AttributesSchema>;

function runPostParse(attributes: Attributes, process: ETL.Process, transformer: ETL.Transformer) {
  const { into } = attributes;
  if (into === "rows") return process;

  const transpose: ETL.Process = {
    id: Symbol(),
    dependents: process.dependents,
    action: { type: "transpose" }
  }

  process.dependents = new Set([transpose.id]);
  transformer.set(transpose.id, transpose);

  return process;
}

async function runProcess(attributes: Attributes, data: ETL.Table[][]): Promise<ETL.Row[]> {
  const { into } = attributes;
  if (into === "columns") {
    // group = transpose(group);
    throw new Error("Transposing 'slice' tag not implemented.")
  }

  const results = new Array<ETL.Row>();

  for (const table of data.flat(1)) {
    for (let i = 0; i < table.data.length; i++) {
      const row = table.data[i];

      results.push({
        type: 'row',
        table: table.table,
        row: i,
        data: row,
        labels: table.labels,
      })
    }
  }

  return results;
}

const Slice = makeBasicRegistration<Attributes, ETL.Table, ETL.Row>({
  name: "slice",
  schema: AttributesSchema,
  types: ["table"],
  act: runProcess,
  postParse: runPostParse,
});

/** ------------------------------------------------------------------------- */

export default Slice;
