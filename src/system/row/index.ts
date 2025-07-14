import { z } from "zod/v4";
import Counter from "./Counter";
import Coerce from "./Coerce";
import Column from "./Column";
import Literal from "./Literal";
import Replace from "./Replace";
import Trim from "./Trim";
import assert from "assert";
import Reference from "./Reference";
import Character from "./Character";
import Multiply from "./Multiply";
import Meta from "./Meta";
import Add from "./Add";
import Equals from "./Equals";
import Concat from "./Concat";
import { State } from "../information/State";
import Divide from "./Divide";
import Sum from "./Sum";

const REGISTERED = [
  Coerce,
  Column,
  Counter,
  Literal,
  Replace,
  Trim,
  Reference,
  Character,
  Multiply,
  Meta,
  Add,
  Equals,
  Concat,
  Divide,
  Sum
] as const;

export const _Schema = z.discriminatedUnion("type", [
  REGISTERED[0].schema,
  ...REGISTERED.slice(1).map(r => r.schema)
]);
type RowTransformation = z.infer<typeof _Schema>;

export async function _runOnce(transformation: RowTransformation, value: string, row: Row, state: State) {
  const transformer = REGISTERED.find(r => r.name === transformation.type);
  assert.ok(transformer != null, `Row transformer ${transformation.type} not found.`);

  // We assume that the transformer takes the schema as valid input.
  return transformer.run(transformation as never, value, row, state);
}

export async function _runMany(transformations: RowTransformation[], row: Row, state: State) {
  let final = "";

  for (const transformation of transformations) {
    final = await _runOnce(transformation, final, row, state);
  }

  return final;
}

/** ------------------------------------------------------------------------- */

const RowTransformation = {
  Schema: _Schema,
  runOnce: _runOnce,
  runMany: _runMany,
}

export default RowTransformation;
