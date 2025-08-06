import { xml2js } from "xml-js";
import { z } from "zod/v4";
import { JSONType } from "zod/dist/types/v4/core/util";

// Holds code to take an XML object, parsed using `xml2js`, and turn it into a
// schema readable by Zod.

/** ------------------------------------------------------------------------- */

/** Possible attributes for an XML Element. */
export type Attributes = Maybe<Record<string, Maybe<JSONType>>>;
/** Possible childrem for an XML element */
export type Children = Maybe<Element[]>;

/** A parsed XML node element. */
export interface NodeElement<N extends string = string, A extends Attributes = Attributes, C extends Children = Children> {
  type: "element";
  name: N;
  attributes: A;
  children: C;
}

/** A parsed XML text element. */
export interface TextElement<T extends JSONType = JSONType> {
  type: "text";
  text: T;
}

/** A parsed XML element. */
export type Element = NodeElement | TextElement;

/** ------------------------------------------------------------------------- */

/**
 * Builds a schema for a parsed XML node element.
 * @param name The name of the element.
 * @param attributes The attributes of the element.
 * @param children The children of the element.
 * @returns The built schema.
 */
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

/**
 * Builds a schema for a parsed text element.
 * @param text The text inside.
 * @returns The schema.
 */
export function makeTextElementSchema<T extends string | number>(text: z.ZodType<T>) {
  return z.strictObject({
    type: z.literal("text"),
    text
  });
}

/** ------------------------------------------------------------------------- */

// The options for the `xml2js` parser.
const XML_OPTIONS: Parameters<typeof xml2js>[1] = {
  ignoreDeclaration: true,
  ignoreComment: true,
  ignoreDoctype: true,
  alwaysArray: true,
  attributesKey: "attributes",
  elementsKey: "children",
  textKey: "text",
}

/**
 * Parse XML into a format readable by Zod.
 * @param text 
 * @returns 
 */
export function fromText(text: string) {
  return xml2js(text, XML_OPTIONS);
}
