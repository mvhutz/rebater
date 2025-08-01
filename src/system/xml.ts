import { xml2js } from "xml-js";
import { z } from "zod/v4";
import { JSONType } from "zod/dist/types/v4/core/util";

/** ------------------------------------------------------------------------- */

export type Attributes = Maybe<Record<string, Maybe<JSONType>>>;
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
  <N extends string, A extends Attributes, C>
  (name: N, attributes: z.ZodType<A>, children: z.ZodType<C>) {
    return z.strictObject({
      type: z.literal("element"),
      name: z.literal(name),
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

export function fromText(text: string) {
  return xml2js(text, XML_OPTIONS);
}
