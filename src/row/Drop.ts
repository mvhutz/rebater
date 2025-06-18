import z from "zod/v4";

const NAME = "drop";

/** ------------------------------------------------------------------------- */

const schema = z.object({
  type: z.literal(NAME),
  criteria: z.array(z.unknown()) // Actually a cell transformation.
});

type Schema = z.infer<typeof schema>;

async function run(transformation: Schema, table: Table): Promise<Table> {
  void [transformation, table];
  throw Error("WIP!");
}

/** ------------------------------------------------------------------------- */

const Drop = { schema, run, name: NAME };
export default Drop;
