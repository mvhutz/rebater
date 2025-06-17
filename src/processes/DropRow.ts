import z from 'zod/v4';
import { makeBasicRegistration } from './Base';
import { ETL } from '../../types';

/** ------------------------------------------------------------------------- */

const AttributesSchema = z.object({
  column: z.coerce.number(),
  is: z.string().optional(),
  isnt: z.string().optional(),
});

type Attributes = z.infer<typeof AttributesSchema>;

async function runProcess(attributes: Attributes, data: ETL.Row[][]): Promise<ETL.Row[]> {
  const { column, is, isnt } = attributes;

  return data.flat(1).filter(r => {
    const datum = r.data[column];
    if (is != null && is == datum) return false;
    if (isnt != null && isnt != datum) return false;
    return true;
  });
}

const DropRow = makeBasicRegistration<Attributes, ETL.Row, ETL.Row>({
  name: "dropRow",
  schema: AttributesSchema,
  act: runProcess
});

/** ------------------------------------------------------------------------- */

export default DropRow;
