import z from "zod/v4";

const NAME = "counter";

/** ------------------------------------------------------------------------- */

const schema = z.object({
  type: z.literal(NAME),
});

type Transformation = z.infer<typeof schema>;

async function run(transformation: Transformation, value: string, row: Row, context: Context) {
  return (context.counter++).toString();
}

const Counter = { schema, run, name: NAME };
export default Counter;