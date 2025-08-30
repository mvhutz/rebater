import { MetaRow } from "./Meta";
import { RowInput, RowOperator } from ".";
import { ReplaceRowData } from "../../shared/transformer/advanced";

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
export class ReplaceRow implements RowOperator {
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
  public constructor(input: ReplaceRowData) {
    this.characters = input.characters;
    this.substring = input.substring;
    this.all = input.all;
    this.put = input.put;
    this.put_meta = input.put_meta && new MetaRow({ type: "meta", value: input.put_meta });
  }

  run(input: RowInput): string {
    let result = input.value;

    let truePut = this.put;
    if (this.put_meta) {
      truePut = this.put_meta.run(input) ?? "";
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
}