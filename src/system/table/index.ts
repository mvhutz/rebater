import { z } from "zod/v4";
import { TableTransformation as TableTransformationType } from "./strategy";
import { Trim } from "./strategy/Trim";
import { Set } from "./strategy/Set";
import { Select } from "./strategy/Select";
import { Percolate } from "./strategy/Percolate";
import { Header } from "./strategy/Header";
import { Filter } from "./strategy/Filter";
import { Debug } from "./strategy/Debug";
import { Coalesce } from "./strategy/Coalesce";
import { Chop } from "./strategy/Chop";

/** ------------------------------------------------------------------------- */

function getSchema() {
  return z.discriminatedUnion("name", [
    Chop.getSchema(),
    Coalesce.getSchema(),
    Debug.getSchema(),
    Filter.getSchema(),
    Header.getSchema(),
    Percolate.getSchema(),
    Select.getSchema(),
    Set.getSchema(),
    Trim.getSchema()
  ]);
}

export type TableSchema = z.infer<ReturnType<typeof getSchema>>;

/** ------------------------------------------------------------------------- */

export const TableTransformation = {
  name: "trim",
  getSchema,

  async run(table, { transformation, state }) {
    switch (transformation.name) {
      case "chop": return await Chop.run(table, { transformation, state });
      case "coalesce": return await Coalesce.run(table, { transformation, state });
      case "debug": return await Debug.run(table, { transformation, state });
      case "filter": return await Filter.run(table, { transformation, state });
      case "header": return await Header.run(table, { transformation, state });
      case "percolate": return await Percolate.run(table, { transformation, state });
      case "select": return await Select.run(table, { transformation, state });
      case "set": return await Set.run(table, { transformation, state });
      case "trim": return await Trim.run(table, { transformation, state });
    }
  },
  
  async runMany(tables, transformations, options) {
    const results = Array<Table>();

    for (const table of tables) {
      let final = table;

      for (const transformation of transformations) {
        final = await TableTransformation.run(final, { transformation, ...options });
      }

      results.push(final);
    }

    return results;
  },
} satisfies TableTransformationType<TableSchema>;
