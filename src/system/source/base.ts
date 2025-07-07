import z from "zod/v4";
import { State } from "../information/State";

/** ------------------------------------------------------------------------- */

export default interface BaseSource<T> {
  getSchema(): z.ZodType<T> & (z.ZodObject | z.ZodDiscriminatedUnion);
  getSourceFileGlob(source: T, state: State): string;

  run(source: T, state: State): Table[];
}