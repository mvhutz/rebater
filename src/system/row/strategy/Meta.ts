import { z } from "zod/v4";
import { RowTransformation as RowTransformationType } from ".";
import { makeNodeElementSchema, makeTextElementSchema } from "../../../system/xml";
import moment from "moment";
import path from "path";

/** ------------------------------------------------------------------------- */

export const META_TYPES = z.union([
  z.literal("quarter.lastday"),
  z.literal("quarter.number"),
  z.literal("row.source"),
]);

const getSchema = () => makeNodeElementSchema(
  z.literal("meta"),
  z.undefined().optional(),
  z.array(makeTextElementSchema(META_TYPES)),
);

type Schema = z.infer<ReturnType<typeof getSchema>>;

/** ------------------------------------------------------------------------- */

export const Meta: RowTransformationType<Schema> = {
  name: "meta",
  getSchema,

  async run(_, { transformation: { children: [{ text }] }, state, row }) {
    switch (text) {
      case "quarter.lastday": {
        const time = state.getSettings().getTime();

        return moment()
          .year(time.year)
          .quarter(time.quarter)
          .endOf("quarter")
          .format("MM/DD/YYYY");
      }

      case "quarter.number": {
        return state.getSettings().getTime().quarter.toString();
      }

      case "row.source": {
        return path.basename(row.table.path);
      }
    }
  }
};
