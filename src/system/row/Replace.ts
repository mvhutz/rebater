import { z } from "zod/v4";
import { META_TYPE, MetaRow } from "./Meta";
import { State } from "../information/State";
import { BaseRow } from ".";

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

  async run(value: string, row: Row, state: State): Promise<string> {
    let result = value;

    let truePut = this.put;
    if (this.put_meta) {
      truePut = await this.put_meta.run("", row, state);
    }

    if (this.characters != null) {
      for (const character of this.characters) {
        result = result.replace(character, truePut);
      }
    }

    if (this.substring != null) {
      result = result.replace(this.substring, truePut);
    }

    if (this.all != null) {
      if (result === this.all) {
        result = truePut;
      }
    }

    return result;
  }
}