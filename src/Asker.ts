import EventEmitter from "events";

/** ------------------------------------------------------------------------- */

interface AskerEvents {
  ask: [string]
}

export class Asker extends EventEmitter<AskerEvents> {
  private data = new Map<string, PromiseWithResolvers<string>>();

  public answer(question: string, answer?: string): void {
    const existing_answer = this.data.get(question);
    if (existing_answer == null) {
      return;
    }

    if (answer == null) {
      existing_answer.reject(`Could not answer: '${question}'`);
    } else {
      existing_answer.resolve(answer);
    }
  }

  public ask(question: string): Promise<string> {
    const existing_answer = this.data.get(question);
    if (existing_answer != null) {
      return existing_answer.promise;
    }

    const new_answer = Promise.withResolvers<string>();
    this.data.set(question, new_answer);
    return new_answer.promise;
  }
}