import { z } from "zod/v4";
import { Excel } from "./strategy/Excel";
import { Source as SourceType } from "./strategy";

/** ------------------------------------------------------------------------- */

function getSchema() {
  return z.discriminatedUnion("name", [
    Excel.getSchema()
  ]);
}

type Schema = z.infer<ReturnType<typeof getSchema>>;

/** ------------------------------------------------------------------------- */

export const Source = {
  name: "excel",
  getSchema,

  run({ source, state }) {
    switch (source.name) {
      case "excel": return Excel.run({ source, state });
    }
  },

  getFileGlob({ source, state }) {
    switch (source.name) {
      case "excel": return Excel.getFileGlob({ source, state });
    }
  },

  runMany(sources, options) {
    return sources
      .map((source): Table[] => Source.run({ source, ...options }))
      .flat(1);
  },
} satisfies SourceType<Schema>;
