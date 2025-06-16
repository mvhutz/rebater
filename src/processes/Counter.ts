import z from 'zod/v4';
import { makeBasicRegistration } from './Base';
import { ETL } from '../../types';
import MAGIC from '../magic';

/** ------------------------------------------------------------------------- */

const AttributesSchema = z.object({
  column: z.coerce.number().optional(),
});

type Attributes = z.infer<typeof AttributesSchema>;

async function runProcess({ column }: Attributes, data: (ETL.Cell | ETL.Row)[][]): Promise<ETL.Cell[]> {
  return data.flat(1).map(cell => ({ 
    ...cell,
    type: 'cell',
    column: column ?? ('column' in cell ? cell.column : 0),
    data: (MAGIC.COUNTER.default++).toString(),
  }));
}

const Counter = makeBasicRegistration<Attributes, ETL.Cell | ETL.Row, ETL.Cell>({
  name: "counter",
  schema: AttributesSchema,
  types: ["cell", "row"],
  act: runProcess
});

/** ------------------------------------------------------------------------- */

export default Counter;
