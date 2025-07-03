import { z } from "zod/v4";
import CSV from "./CSV";
import assert from "node:assert";
import { State } from "../information/State";

const REGISTERED = [
  CSV
] as const;

export const DestinationSchema = z.discriminatedUnion("type", [
  REGISTERED[0].schema,
  ...REGISTERED.slice(1).map(r => r.schema)
]);
type Destination = z.infer<typeof DestinationSchema>;

async function runOnce(source: Destination, table: Table, state: State) {
  const transformer = REGISTERED.find(r => r.name === source.type);
  assert.ok(transformer != null, `Destination ${source.type} not found.`);

  // We assume that the transformer takes the schema as valid input.
  return await transformer.run(source as never, table, state);
}

/** ------------------------------------------------------------------------- */

const Destination = {
  runOnce,
  Schema: DestinationSchema,
}

export default Destination;