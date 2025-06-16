import z from 'zod/v4';
import { makeBasicRegistration } from './Base';
import { ETL } from '../../types';

/** ------------------------------------------------------------------------- */

function coerceDate(datum: string): string {
  const date = new Date(datum);
  return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
}

function coerceNumber(datum: string): string {
  return parseInt(datum).toString();
}

function coerceUSD(datum: string): string {
  return `$${Number(datum).toFixed(2)}`;
}

const COERCERS = {
  date: coerceDate,
  number: coerceNumber,
  usd: coerceUSD
} as const;

/** ------------------------------------------------------------------------- */

const AttributesSchema = z.object({
  as: z.object(COERCERS).keyof(),
});

type Attributes = z.infer<typeof AttributesSchema>;

async function runProcess(attributes: Attributes, data: ETL.Cell[][]): Promise<ETL.Cell[]> {
  const { as } = attributes;
  return data.flat(1).map(cell => ({ ...cell, data: COERCERS[as](cell.data) }));
}

const Coerce = makeBasicRegistration<Attributes, ETL.Cell, ETL.Cell>({
  name: "coerce",
  schema: AttributesSchema,
  types: ["cell"],
  act: runProcess
});

/** ------------------------------------------------------------------------- */

export default Coerce;
