import z from 'zod/v4';
import { makeBasicRegistration } from './Base';
import { ETL } from '../../types';

/** ------------------------------------------------------------------------- */

const AttributesSchema = z.object({
  top: z.coerce.number().default(0),
  bottom: z.coerce.number().optional(),
  left: z.coerce.number().default(0),
  right: z.coerce.number().optional()
});

type Attributes = z.infer<typeof AttributesSchema>;

async function runProcess(attributes: Attributes, data: ETL.Table[][]): Promise<ETL.Table[]> {
  const { top, bottom, left, right } = attributes;

  return data.flat(1).map(table => ({ 
    ...table,
    data: table.data.slice(top, bottom).map(r => r.slice(left, right))
  }));
}

const Trim = makeBasicRegistration<Attributes, ETL.Table, ETL.Table>({
  name: "trim",
  schema: AttributesSchema,
  types: ["table"],
  act: runProcess
});

/** ------------------------------------------------------------------------- */

export default Trim;
