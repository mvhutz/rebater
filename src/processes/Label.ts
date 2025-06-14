import z from 'zod/v4';
import { makeBasicRegistration } from './Base';

/** ------------------------------------------------------------------------- */

const AttributesSchema = z.object({
  add: z.string().optional(),
  filter: z.string().optional(),
});

type Attributes = z.infer<typeof AttributesSchema>;

async function runProcess(attributes: Attributes, data: ETL.Data[][]): Promise<ETL.Data[]> {
  const { filter, add } = attributes;

  let input = data.flat(1);

  if (filter != null) {
    input = input.filter(s => s.labels.has(filter))
  }

  if (add != null) {
    input = input.map(s => ({ ...s, labels: new Set([add, ...s.labels]) }))
  }

  return input;
}

const Label = makeBasicRegistration<Attributes, ETL.Data, ETL.Data>({
  name: "label",
  schema: AttributesSchema,
  act: runProcess
});

/** ------------------------------------------------------------------------- */

export default Label;
