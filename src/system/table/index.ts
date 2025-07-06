import { z } from "zod/v4";
import Chop from "./Chop";
import Filter from "./Filter";
import Select from "./Select";
import Trim from "./Trim";
import assert from "assert";
import Header from "./Header";
import Coalesce from "./Coalesce";
import Debug from "./Debug";
import Percolate from "./Percolate";
import { State } from "../information/State";

/** ------------------------------------------------------------------------- */

const REGISTERED = [
  Chop,
  Filter,
  Select,
  Trim,
  Header,
  Coalesce,
  Debug,
  Percolate
] as const;

export const TableTransformationSchema = z.discriminatedUnion("type", [
  REGISTERED[0].schema,
  ...REGISTERED.slice(1).map(r => r.schema)
]);
type TableTransformation = z.infer<typeof TableTransformationSchema>;

async function runOnce(transformation: TableTransformation, table: Table, state: State) {
  const transformer = REGISTERED.find(r => r.name === transformation.type);
  assert.ok(transformer != null, `Row transformer ${transformation.type} not found.`);

  // We assume that the transformer takes the schema as valid input.
  return await transformer.run(transformation as never, table, state);
}

async function runMany(transformations: TableTransformation[], tables: Table[], state: State) {
  const results = Array<Table>();

  for (const table of tables) {
    let final = table;

    for (const transformation of transformations) {
      final = await runOnce(transformation, final, state);
    }

    results.push(final);
  }

  return results;
}

/** ------------------------------------------------------------------------- */

const TableTransformation = {
  runOnce,
  runMany,
  Schema: TableTransformationSchema,
}

export default TableTransformation;
