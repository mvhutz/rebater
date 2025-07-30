import { z } from "zod/v4";
import { BaseRow } from ".";
import { Runner } from "../runner/Runner";

/** ------------------------------------------------------------------------- */

export class ReferenceRow implements BaseRow {
  private readonly table: string;
  private readonly match: string;
  private readonly take: string;
  private readonly group: string;

  public constructor(table: string, match: string, take: string, group: string) {
    this.table = table;
    this.match = match;
    this.take = take;
    this.group = group;
  }

  private getQuestionFormat(group: string, take: string, table: string, value: string) {
    return `For **\`${group}\`**, what is the **\`${take}\`** of this **\`${table}\`**?\n\n *\`${value}\`*`;
  }

  async run(value: string, row: Row, runner: Runner): Promise<Maybe<string>> {
    const result = runner.references.ask(this.table, this.match, value, this.take, this.group);
    if (result != null) {
      return result;
    }

    const question = this.getQuestionFormat(this.group, this.take, this.table, value);
    const answer = await runner.asker.ask(question);
    if (answer == null) return null;
    
    runner.references.answer(this.table, this.match, value, this.take, this.group, answer);
    
    return answer;
  }

  public static readonly SCHEMA = z.strictObject({
    type: z.literal("reference"),
    table: z.string(),
    match: z.string(),
    take: z.string(),
    group: z.string(),
  }).transform(s => new ReferenceRow(s.table, s.match, s.take, s.group));
}
