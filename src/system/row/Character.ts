import { z } from "zod/v4";
import { BaseRow } from ".";
import { makeNodeElementSchema, makeTextElementSchema } from "../xml";
import { XMLElement } from "xmlbuilder";

/** ------------------------------------------------------------------------- */

export interface CharacterRowData {
  type: "character";
  select: string;
  action?: "keep" | "drop";
}

/** ------------------------------------------------------------------------- */

/**
 * Filter out certain characters from a string.
 * 
 * This operation selects all characters in a value that exists in a specified
 * string. Then it either chooses to discard those characters, or keep only
 * those, and discard the rest.
 */
export class CharacterRow implements BaseRow {
  /** The set of characters to match for. */
  private readonly select: string;
  /** Whether the keep or drop the matching characters. */
  private readonly action: "keep" | "drop";

  /**
   * Create a character operation.
   * @param select The set of characters to match for.
   * @param action Whether the keep or drop the matching characters.
   */
  public constructor(select: string, action: "keep" | "drop") {
    this.select = select;
    this.action = action;
  }

  run(value: string): Maybe<string> {
    const characters = value.split("");
    return characters
      .filter(c => this.select.includes(c) === (this.action === "keep"))
      .join("");
  }

  buildJSON(): CharacterRowData {
    return {
      type: "character",
      select: this.select,
      action: this.action
    }
  }

  public static readonly SCHEMA: z.ZodType<BaseRow, CharacterRowData> = z.strictObject({
    type: z.literal("character"),
    select: z.string(),
    action: z.union([z.literal("keep"), z.literal("drop")]).default("keep")
  }).transform(s => new CharacterRow(s.select, s.action));

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