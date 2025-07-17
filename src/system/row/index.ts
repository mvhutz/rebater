import { z } from "zod/v4";
import { Add } from "./strategy/Add";
import { RowTransformation as RowTransformationType } from "./strategy";
import { Coerce } from "./strategy/Coerce";
import { Column } from "./strategy/Column";
import { Counter } from "./strategy/Counter";
import { Literal } from "./strategy/Literal";
import { Replace } from "./strategy/Replace";
import { Trim } from "./strategy/Trim";
import { Reference } from "./strategy/Reference";
import { Character } from "./strategy/Character";
import { Multiply } from "./strategy/Multiply";
import { Meta } from "./strategy/Meta";
import { Equals } from "./strategy/Equals";
import { Concat } from "./strategy/Concat";
import { Divide } from "./strategy/Divide";
import { Sum } from "./strategy/Sum";

/** ------------------------------------------------------------------------- */

function getSchema() {
  return z.discriminatedUnion("name", [
    Add.getSchema(),
    Coerce.getSchema(),
    Column.getSchema(),
    Counter.getSchema(),
    Literal.getSchema(),
    Replace.getSchema(),
    Trim.getSchema(),
    Reference.getSchema(),
    Character.getSchema(),
    Multiply.getSchema(),
    Meta.getSchema(),
    Equals.getSchema(),
    Concat.getSchema(),
    Divide.getSchema(),
    Sum.getSchema()
  ]);
}

type Schema = z.infer<ReturnType<typeof getSchema>>;

/** ------------------------------------------------------------------------- */

export const RowTransformation = {
  name: "add",
  getSchema,

  run(value, { transformation, state, row }) {
    switch (transformation.name) {
      case "add": return Add.run(value, { transformation, state, row });
      case "coerce": return Coerce.run(value, { transformation, state, row });
      case "column": return Column.run(value, { transformation, state, row });
      case "counter": return Counter.run(value, { transformation, state, row });
      case "literal": return Literal.run(value, { transformation, state, row });
      case "replace": return Replace.run(value, { transformation, state, row });
      case "trim": return Trim.run(value, { transformation, state, row });
      case "reference": return Reference.run(value, { transformation, state, row });
      case "character": return Character.run(value, { transformation, state, row });
      case "multiply": return Multiply.run(value, { transformation, state, row });
      case "meta": return Meta.run(value, { transformation, state, row });
      case "equals": return Equals.run(value, { transformation, state, row });
      case "concat": return Concat.run(value, { transformation, state, row });
      case "divide": return Divide.run(value, { transformation, state, row });
      case "sum": return Sum.run(value, { transformation, state, row });
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
