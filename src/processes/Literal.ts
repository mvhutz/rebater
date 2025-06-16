import z from 'zod/v4';
import { makeBasicRegistration } from './Base';
import { ETL } from '../../types';

/** ------------------------------------------------------------------------- */

const AttributesSchema = z.object({
  value: z.string(),
  column: z.coerce.number().optional(),
});

type Attributes = z.infer<typeof AttributesSchema>;

async function runProcess(attributes: Attributes, data: (ETL.Cell | ETL.Row)[][]): Promise<ETL.Cell[]> {
  const { value, column } = attributes;

  return data.flat(1).map(cell => ({ 
    ...cell,
    type: 'cell',
    column: column ?? ('column' in cell ? cell.column : 0),
    data: value
  }));
}

const Literal = makeBasicRegistration<Attributes, ETL.Cell | ETL.Row, ETL.Cell>({
  name: "literal",
  schema: AttributesSchema,
  types: ["cell", "row"],
  act: runProcess
});

/** ------------------------------------------------------------------------- */

export default Literal;
