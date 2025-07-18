import z from "zod/v4";
import { State } from "../../information/State";
import { NodeElement } from "../../xml";

/** ------------------------------------------------------------------------- */

export interface Options {
  row: Row;
  state: State;
}

export interface RunOptions<E> extends Options {
  transformation: E;
}

export interface RowTransformation<E extends NodeElement> {
  name: E["name"];
  getSchema(): z.ZodType<E> & (z.ZodDiscriminatedUnion | z.ZodObject);

  run(value: string, options: RunOptions<E>): Promise<string>;
  runMany?: (transformations: E[], options: Options) => Promise<string>;
}