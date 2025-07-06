import { z } from "zod/v4";
import { ExcelSource } from "./Excel";
import assert from "assert";
import { State } from "../information/State";

/** ------------------------------------------------------------------------- */

function getSchema() {
  return z.discriminatedUnion("type", [
    ExcelSource.getSchema()
  ]);
}

type Schema = z.infer<ReturnType<typeof getSchema>>;

function run(source: Schema, state: State) {
  switch (source.type) {
    case "excel": return ExcelSource.run(source, state);
  }
}

function getSourceFileGlob(source: Schema, state: State) {
  switch (source.type) {
    case "excel": return ExcelSource.getSourceFileGlob(source, state);
  }
}

function runMany(sources: Schema[], state: State) {
  const results = sources.map(s => run(s, state));
  return results.flat(1);
}

/** ------------------------------------------------------------------------- */

export const Source = { run, runMany, getSchema, getSourceFileGlob };
