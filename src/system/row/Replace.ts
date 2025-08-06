import { z } from "zod/v4";
import { META_TYPE, MetaRow } from "./Meta";
import { BaseRow } from ".";
import { Runner } from "../runner/Runner";
import { XMLElement } from "xmlbuilder";
import { makeNodeElementSchema } from "../xml";

/** ------------------------------------------------------------------------- */

/**
 * Replace certain substrings in a value with other.
 * 
 * If you specify a set of characters, they will be replaced, each individually.
 * If you specify a substring, each matching substring will be replaced.
 * If you specify all, the entire string will be replaced if it matches this value.
 * 
 * Each instance will be replaced with "put".
 * If you specify "put_meta", a meta-value will be replaced, instead.
 */
export class ReplaceRow implements BaseRow {
  /** All characters to replace. */
  private readonly characters?: string;
  /** All substrings to replace. */
  private readonly substring?: string;
  /** If the entire string matches this value, it will be replaced. */
  private readonly all?: string;
  /** Replace each instance with this value. */
  private readonly put: string;
  /** Replace each instance with this meta-value. */
  private readonly put_meta?: MetaRow;

  /**
   * Create a replace operation.
   * @param put Replace each instance with this value.
   * @param put_meta Replace each instance with this meta-value.
   * @param all If the entire string matches this value, it will be replaced.
   * @param substring All substrings to replace.
   * @param characters All characters to replace.
   */
  public constructor(put: string, put_meta?: MetaRow["value"], all?: string, substring?: string, characters?: string) {
    this.characters = characters;
    this.substring = substring;
    this.all = all;
    this.put = put;
    this.put_meta = put_meta && new MetaRow(put_meta);
  }

  async run(value: string, row: Row, runner: Runner): Promise<string> {
    let result = value;

    let truePut = this.put;
    if (this.put_meta) {
      truePut = await this.put_meta.run("", row, runner);
    }

    if (this.characters != null) {
      for (const character of this.characters) {
        result = result.replace(character, truePut);
      }
    }

    if (this.substring != null) {
      result = result.replace(new RegExp(this.substring), truePut);
    }

    if (this.all != null) {
      if (result === this.all) {
        result = truePut;
      }
    }

    return result;
  }

  public static readonly SCHEMA = z.strictObject({
    type: z.literal("replace"),
    characters: z.string().min(1).optional(),
    substring: z.string().min(1).optional(),
    all: z.string().optional(),
    put: z.string().default(""),
    put_meta: META_TYPE.optional(),
  }).transform(s => new ReplaceRow(s.put, s.put_meta, s.all, s.substring, s.characters));

  buildXML(from: XMLElement): void {
    from.element("replace", {
      characters: this.characters,
      substring: this.substring,
      all: this.all,
      put: this.put,
      put_meta: this.put_meta?.value,
    })
  }

  public static readonly XML_SCHEMA = makeNodeElementSchema("replace",
    z.strictObject({
      characters: z.string().min(1).optional(),
      substring: z.string().min(1).optional(),
      all: z.string().optional(),
      put: z.string().default(""),
      put_meta: META_TYPE.optional(),
    }),
    z.undefined())
    .transform(({ attributes: a }) => new ReplaceRow(a.put, a.put_meta, a.all, a.substring, a.characters))
}