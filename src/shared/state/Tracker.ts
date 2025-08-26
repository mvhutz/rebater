import { Question } from "../worker/response";

/**
 * Stores any question makde by the Transformers.
 */
export class Tracker {
  private values = new Map<string, Question>();

  ask(question: Question) {
    const current = this.values.get(question.hash);
    if (current != null) return;

    this.values.set(question.hash, question);
  }
}
