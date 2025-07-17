import z from "zod/v4";
import { State } from "../../information/State";
import { NodeElement } from "../../xml";

/** ------------------------------------------------------------------------- */

export interface Options<E> {
  destination: E;
  state: State;
}

export interface Destination<E extends NodeElement> {
  name: E["name"];
  getSchema(): z.ZodType<E> & (z.ZodDiscriminatedUnion | z.ZodObject);

  getFile(options: Options<E>): string;
  run(table: Table, options: Options<E>): void;
}