import { xml2js } from "xml-js";
import { z } from "zod/v4";
import { bad, good, Reply } from "src/shared/reply";
import { JSONType } from "zod/dist/types/v4/core/util";

/** ------------------------------------------------------------------------- */

export type Attributes = Maybe<Record<string, JSONType>>;
export type Children = Maybe<Element[]>;

export interface NodeElement<N extends string = string, A extends Attributes = Attributes, C extends Children = Children> {
  type: "element";
  name: N;
  attributes: A;
  children: C;
}

export interface TextElement<T extends JSONType = JSONType> {
  type: "text";
  text: T;
}

export type Element = NodeElement | TextElement;

/** ------------------------------------------------------------------------- */

export function makeNodeElementSchema
  <N extends string, A extends Attributes, C extends Children>
  (name: z.ZodType<N>, attributes: z.ZodType<A>, children: z.ZodType<C>) {
    return z.strictObject({
      type: z.literal("element"),
      name,
      attributes,
      children
    });
  }

export function makeNodeElement
  <N extends string, A extends Attributes, C extends Children>
  (name: N, attributes: A = [][0], children: C = [][0]): NodeElement<N, A, C> {
    return { type: "element", name, attributes, children };
  }

export function makeTextElementSchema<T extends string | number>(text: z.ZodType<T>) {
  return z.strictObject({
    type: z.literal("text"),
    text
  });
}

export function makeTextElement<T extends string>(text: T): TextElement<T> {
  return { type: "text", text };
}

export const NodeElementSchema = makeNodeElementSchema(
  z.string(),
  z.record(z.string(), z.any()).optional(),
  z.lazy(() => z.array(ElementSchema).optional())
);

export const TextElementSchema = makeTextElementSchema(z.string());

export const ElementSchema: z.ZodType<Element> = z.discriminatedUnion("type", [
  TextElementSchema,
  NodeElementSchema
])

/** ------------------------------------------------------------------------- */

const XML_OPTIONS: Parameters<typeof xml2js>[1] = {
  ignoreDeclaration: true,
  ignoreComment: true,
  ignoreDoctype: true,
  alwaysArray: true,
  attributesKey: "attributes",
  elementsKey: "children",
  textKey: "text",
}

export function fromText(text: string): Reply<Element> {
  const json = xml2js(text, XML_OPTIONS);
  const { success, data, error } = ElementSchema.safeParse(json);
  if (success) return good(data);

  return bad(`Could not parse XML: ${z.prettifyError(error)}`);
}
