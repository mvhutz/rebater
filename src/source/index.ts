import z from "zod/v4";
import Excel from "./Excel";
import assert from "node:assert";

/** ------------------------------------------------------------------------- */

const REGISTERED = [
  Excel
] as const;

export const SourceSchema = z.discriminatedUnion("type", [
  REGISTERED[0].schema,
  ...REGISTERED.slice(1).map(r => r.schema)
]);
type Source = z.infer<typeof SourceSchema>;

async function runOnce(source: Source, context: Context) {
  const transformer = REGISTERED.find(r => r.name === source.type);
  assert.ok(transformer != null, `Source ${source.type} not found.`);

  // We assume that the transformer takes the schema as valid input.
  return await transformer.run(source as never, context);
}

async function runMany(sources: Source[], context: Context) {
  const results = await Promise.all(sources.map(s => runOnce(s, context)));
  return results.flat(1);
}

/** ------------------------------------------------------------------------- */

const Source = {
  runOnce,
  runMany,
  Schema: SourceSchema,
}

export default Source;