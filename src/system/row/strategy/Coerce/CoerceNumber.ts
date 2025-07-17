import { z } from "zod/v4";

const NAME = "number";

/** ------------------------------------------------------------------------- */

const attributes = z.strictObject({
  as: z.literal(NAME),
  otherwise: z.string().optional(),
});

type Attributes = z.infer<typeof attributes>;

function run(datum: string, attributes: Attributes) {
  const float = parseFloat(datum);

  if (isNaN(float) && attributes.otherwise != null) {
    return attributes.otherwise;
  } else {
    return float.toString();
  }
}

/** ------------------------------------------------------------------------- */

const CoerceNumber = { attributes, run, name: NAME };
export default CoerceNumber;