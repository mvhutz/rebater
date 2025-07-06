import z from "zod/v4";
import { State } from "../information/State";

/** ------------------------------------------------------------------------- */

export default interface BaseDestination<T> {
  getSchema(): z.ZodType<T> & (z.ZodObject | z.ZodDiscriminatedUnion);
  getDestinationFile(destination: T, state: State): string;

  run(destination: T, table: Table, state: State): void;
}