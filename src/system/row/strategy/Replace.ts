import { z } from "zod/v4";
import { RowTransformation as RowTransformationType } from ".";
import { makeNodeElement, makeNodeElementSchema, makeTextElement } from "../../../system/xml";
import { Meta, META_TYPES } from "./Meta";

/** ------------------------------------------------------------------------- */

const getSchema = () => makeNodeElementSchema(
  z.literal("replace"),
  z.strictObject({
    type: z.literal("replace"),
    characters: z.string().min(1).optional(),
    substring: z.string().min(1).optional(),
    all: z.string().optional(),
    put: z.string().default(""),
    put_meta: META_TYPES,
  }),
  z.undefined()
);

type Schema = z.infer<ReturnType<typeof getSchema>>;

/** ------------------------------------------------------------------------- */

export const Replace: RowTransformationType<Schema> = {
  name: "replace",
  getSchema,

  async run(value, { state, row, transformation: { attributes: { characters, put, substring, put_meta, all } } }) {
    let result = value;

    let truePut = put;
    if (put_meta) {
      truePut = await Meta.run("", {
        row,
        state,
        transformation: makeNodeElement("meta", undefined, [makeTextElement(put_meta)])
      });
    }

    if (characters != null) {
      for (const character of characters) {
        result = result.replace(character, truePut);
      }
    }

    if (substring != null) {
      result = result.replace(substring, truePut);
    }

    if (all != null) {
      if (result === all) {
        result = truePut;
      }
    }

    return result;
  }
};
