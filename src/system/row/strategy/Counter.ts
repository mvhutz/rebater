import { z } from "zod/v4";
import { RowTransformation as RowTransformationType } from ".";
import { makeNodeElementSchema } from "../../../system/xml";

/** ------------------------------------------------------------------------- */

const getSchema = () => makeNodeElementSchema(
  z.literal("counter"),
  z.never(),
  z.never()
);

type Schema = z.infer<ReturnType<typeof getSchema>>;

/** ------------------------------------------------------------------------- */

export const Counter: RowTransformationType<Schema> = {
  name: "counter",
  getSchema,

  async run(_, { state, transformation: { type } }) {
    const counter = state.getCounter(type);
    const result = counter.get();
    counter.increment();

    return result.toString();
  }
};
