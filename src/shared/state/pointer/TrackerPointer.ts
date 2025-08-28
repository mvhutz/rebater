import z from "zod/v4";
import { bad, good, Reply } from "../../reply";
import { Question, QuestionSchema } from "../../worker/response";
import { FilePointer } from "./FilePointer";
import { Answer } from "../../worker/request";

/** ------------------------------------------------------------------------- */

const TrackerSchema = z.array(z.tuple([z.string(), QuestionSchema]));

/**
 * Stores any question makde by the Transformers.
 */
export class TrackerPointer extends FilePointer<Map<string, Question>> {
  public serialize(data: Map<string, Question>): Reply<string> {
    return good(JSON.stringify(data.entries().toArray()));
  }
  public deserialize(data: string): Reply<Map<string, Question>> {
    let json: unknown;
    try {
      json = JSON.parse(data);
    } catch (err) {
      return bad(`Could not parse tracker JSON: ${err}`);
    }

    const parsed = TrackerSchema.safeParse(json);
      
    if (!parsed.success) {
      return bad(z.prettifyError(parsed.error));
    } else {
      return good(new Map(parsed.data));
    }
  }

  has(hash: string) {
    if (!this.data.ok) return false;
    return this.data.data.has(hash);
  }

  async answer(answer: Answer) {
    await this.update(async tracker => {
      if (!tracker.ok) return tracker;

      const new_questions = new Map(tracker.data.entries());
      new_questions.delete(answer.hash);

      return good(new_questions);
    });
  }

  markAsk(question: Question) {
    const tracker = this.data.ok ? this.data.data : new Map<string, Question>();

    const current = tracker.get(question.hash);
    if (current != null) return;

    const new_map = new Map(tracker.entries());
    new_map.set(question.hash, question);
    
    this.data = good(new_map);
  }
}
