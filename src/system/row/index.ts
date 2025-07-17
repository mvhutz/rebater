import { z } from "zod/v4";
import { Add } from "./strategy/Add";
import { RowTransformation as RowTransformationType } from "./strategy";

/** ------------------------------------------------------------------------- */

function getSchema() {
  return z.discriminatedUnion("name", [
    Add.getSchema()
  ]);
}

type Schema = z.infer<ReturnType<typeof getSchema>>;

/** ------------------------------------------------------------------------- */

export const RowTransformation = {
  name: "add",
  getSchema,

  run(table, options) {
    switch (options.transformation.name) {
      case "add": return Add.run(table, options);
    }
  },
  
  async runMany(transformations, options) {
    let value = "";

    for (const transformation of transformations) {
      value = await RowTransformation.run(value, { ...options, transformation });
    }

    return value;
  },
} satisfies RowTransformationType<Schema>;
