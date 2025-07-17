import z from "zod/v4";
import { State } from "../../information/State";
import { NodeElement } from "../../xml";

/** ------------------------------------------------------------------------- */

export interface Options {
  state: State;
}

export interface RunOptions<E> extends Options {
  transformation: E;
}

export interface TableTransformation<E extends NodeElement> {
  name: E["name"];
  getSchema(): z.ZodType<E> & (z.ZodDiscriminatedUnion | z.ZodObject);

  run(value: Table, options: RunOptions<E>): Promise<Table>;
  runMany?: (tables: Table[], transformations: E[], options: Options) => Promise<Table[]>;
}