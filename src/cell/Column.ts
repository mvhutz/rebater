import z from "zod/v4";

const NAME = "column";

/** ------------------------------------------------------------------------- */

const schema = z.object({
  type: z.literal(NAME),
  index: z.union([z.number(), z.string().regex(/[A-Z]+/)]),
});

type Transformation = z.infer<typeof schema>;

function fromExcelColumn(letters: string): number {
  let result = 0;

  for (let p = 0; p < letters.length; p++) {
      result = letters.charCodeAt(p) - 64 + result * 26;
  }

  return result - 1;
}


async function run(transformation: Transformation, value: string, row: Row) {
  if (typeof transformation.index === "string") {
    const index = fromExcelColumn(transformation.index);
    return row.data[index];
  } else {
    return row.data[transformation.index];
  }
}

/** ------------------------------------------------------------------------- */

const Column = { schema, run, name: NAME };
export default Column;