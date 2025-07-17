import { z } from "zod/v4";
import CoerceDate from "./CoerceDate";
import CoerceNumber from "./CoerceNumber";
import CoerceUSD from "./CoerceUSD";
import { RowTransformation as RowTransformationType } from "..";
import { makeNodeElementSchema } from "../../../xml";

/** ------------------------------------------------------------------------- */

const attributes = z.discriminatedUnion("as", [
  CoerceDate.attributes,
  CoerceNumber.attributes,
  CoerceUSD.attributes
]);

const getSchema = () => makeNodeElementSchema(
  z.literal("coerce"),
  attributes,
  z.undefined()
)

type Schema = z.infer<ReturnType<typeof getSchema>>;

/** ------------------------------------------------------------------------- */

export const Coerce: RowTransformationType<Schema> = {
  name: "coerce",
  getSchema,

  async run(value, { state, transformation: { attributes } }) {
    switch (attributes.as) {
      case "date": return CoerceDate.run(value, attributes, state);
      case "number": return CoerceNumber.run(value, attributes);
      case "usd": return CoerceUSD.run(value, attributes);
    }
  }
};