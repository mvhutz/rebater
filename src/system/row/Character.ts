import { z } from "zod/v4";
import { BaseRow } from ".";
import { Element, makeNodeElement, makeNodeElementSchema, makeTextElement, makeTextElementSchema } from "../xml";
import { XMLElement } from "xmlbuilder";

/** ------------------------------------------------------------------------- */

export class CharacterRow implements BaseRow {
  public static readonly SCHEMA = z.strictObject({
    type: z.literal("character"),
    select: z.string(),
    action: z.union([z.literal("keep"), z.literal("drop")]).default("keep")
  }).transform(s => new CharacterRow(s.select, s.action));

  private readonly select: string;
  private readonly action: "keep" | "drop";

  public constructor(select: string, action: "keep" | "drop") {
    this.select = select;
    this.action = action;
  }

  async run(value: string): Promise<string> {
    const characters = value.split("");
    return characters
      .filter(c => this.select.includes(c) === (this.action === "keep"))
      .join("");
  }

  toXML(): Element {
    return makeNodeElement("character", {
      action: this.action
    }, [
      makeTextElement(this.select)
    ]); 
  }

  buildXML(from: XMLElement): void {
    from.element("character", {
      action: this.action
    }, this.select);
  }

  public static readonly XML_SCHEMA = makeNodeElementSchema("character",
    z.strictObject({
      action: z.union([z.literal("keep"), z.literal("drop")]).default("keep")
    }),
    z.tuple([makeTextElementSchema(z.string())]))
    .transform(({ attributes: a, children: c }) => new CharacterRow(c[0].text, a.action))
}