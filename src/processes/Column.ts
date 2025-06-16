import z from 'zod/v4';
import { makeBasicRegistration } from './Base';
import { ETL } from '../../types';

/** ------------------------------------------------------------------------- */

const AttributesSchema = z.object({
  index: z.coerce.number(),
});

type Attributes = z.infer<typeof AttributesSchema>;

async function runProcess(attributes: Attributes, data: ETL.Row[][]): Promise<ETL.Cell[]> {
  const { index } = attributes;

  return data.flat(1).map(row => ({
    type: "cell",
    table: row.table,
    row: row.row,
    column: index,
    data: row.data[index],
    labels: row.labels
  }));
}

const Column = makeBasicRegistration<Attributes, ETL.Row, ETL.Cell>({
  name: "column",
  schema: AttributesSchema,
  types: ["row"],
  act: runProcess
});

/** ------------------------------------------------------------------------- */

export default Column;
