import { z } from "zod/v4";
import { META_TYPE, MetaRow } from "./Meta";
import { BaseRow } from ".";
import { Runner } from "../runner/Runner";
import { XMLElement } from "xmlbuilder";
import { makeNodeElementSchema } from "../xml";

/** ------------------------------------------------------------------------- */

export class ReplaceRow implements BaseRow {
  public static readonly SCHEMA = z.strictObject({
    type: z.literal("replace"),
    characters: z.string().min(1).optional(),
    substring: z.string().min(1).optional(),
    all: z.string().optional(),
    put: z.string().default(""),
    put_meta: META_TYPE.optional(),
  }).transform(s => new ReplaceRow(s.put, s.put_meta, s.all, s.substring, s.characters));

  private readonly characters?: string;
  private readonly substring?: string;
  private readonly all?: string;
  private readonly put: string;
  private readonly put_meta?: MetaRow;

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