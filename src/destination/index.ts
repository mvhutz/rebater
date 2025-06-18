import z from "zod/v4";
import CSV from "./CSV";
import assert from "node:assert";

const REGISTERED = [
  CSV
] as const;

const DestinationSchema = z.union(REGISTERED.map(e => e.schema));
type Destination = z.infer<typeof DestinationSchema>;

async function runOnce(source: Destination, table: Table, context: Context) {
  const transformer = REGISTERED.find(r => r.name === source.type);
  assert.ok(transformer != null, `Destination ${source.type} not found.`);

  // We assume that the transformer takes the schema as valid input.
  return await transformer.run(source as never, table, context);
}

/** ------------------------------------------------------------------------- */

const Destination = {
  runOnce,
  Schema: DestinationSchema,
}

export default Destination;