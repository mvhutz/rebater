import z from "zod/v4";
import Counter from "./Counter";
import Coerce from "./Coerce";
import Column from "./Column";
import Literal from "./Literal";
import Replace from "./Replace";
import Trim from "./Trim";
import assert from "node:assert";
import Reference from "./Reference";

const REGISTERED = [
  Coerce,
  Column,
  Counter,
  Literal,
  Replace,
  Trim,
  Reference
] as const;

export const CellTransformationSchema = z.union(REGISTERED.map(e => e.schema));

export type CellTransformation = z.infer<typeof CellTransformationSchema>;

export async function runOnce(transformation: CellTransformation, value: string, row: Row, context: Context) {
  void context;

  const transformer = REGISTERED.find(r => r.name === transformation.type);
  assert.ok(transformer != null, `Cell transformer ${transformation.type} not found.`);

  // We assume that the transformer takes the schema as valid input.
  return transformer.run(transformation as never, value, row, context);
}

export async function runMany(transformations: CellTransformation[], row: Row, context: Context) {
  let final = "";

  for (const transformation of transformations) {
    final = await runOnce(transformation, final, row, context);
  }

  return final;
}
