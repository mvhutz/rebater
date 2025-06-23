import z from "zod/v4";
import Chop from "./Chop";
import Filter from "./Filter";
import Select from "./Select";
import Trim from "./Trim";
import assert from "node:assert";
import Header from "./Header";
import Coalesce from "./Coalesce";
import Debug from "./Debug";

/** ------------------------------------------------------------------------- */

const REGISTERED = [
  Chop,
  Filter,
  Select,
  Trim,
  Header,
  Coalesce,
  Debug
] as const;

const RowTransformationSchema = z.union(REGISTERED.map(e => e.schema));
type RowTransformation = z.infer<typeof RowTransformationSchema>;

async function runOnce(transformation: RowTransformation, table: Table, context: Context) {
  const transformer = REGISTERED.find(r => r.name === transformation.type);
  assert.ok(transformer != null, `Row transformer ${transformation.type} not found.`);

  // We assume that the transformer takes the schema as valid input.
  return await transformer.run(transformation as never, table, context);
}

async function runMany(transformations: RowTransformation[], tables: Table[], context: Context) {
  const results = Array<Table>();

  for (const table of tables) {
    let final = table;

    for (const transformation of transformations) {
      final = await runOnce(transformation, final, context);
    }

    results.push(final);
  }

  return results;
}

/** ------------------------------------------------------------------------- */

const RowTransformation = {
  runOnce,
  runMany,
  Schema: RowTransformationSchema,
}

export default RowTransformation;
