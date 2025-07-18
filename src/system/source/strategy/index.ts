import z from "zod/v4";
import { State } from "../../information/State";
import { NodeElement } from "../../xml";

/** ------------------------------------------------------------------------- */

export interface RunManyOptions {
  state: State;
}

export interface RunOptions<E> {
  source: E;
  state: State;
}

export interface Source<E extends NodeElement> {
  name: E["name"];
  getSchema(): z.ZodType<E> & (z.ZodDiscriminatedUnion | z.ZodObject);

  getFileGlob(options: RunOptions<E>): string;
  run(options: RunOptions<E>): Table[];
  runMany?: (sources: E[], options: RunManyOptions) => Table[];
}
