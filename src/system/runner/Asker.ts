import EventEmitter from "events";
import { Question } from "../../shared/worker/response";
import { Answer } from "../../shared/worker/request";

/** ------------------------------------------------------------------------- */

interface AskerEvents {
  ask: [Question]
}

export class Asker extends EventEmitter<AskerEvents> {
  private data = new Map<string, PromiseWithResolvers<Answer>>();
  private ignore_all = false;

  public ignoreAll() {
    this.ignore_all = true;

    for (const [hash, resolvers] of this.data) {
      resolvers.resolve({ hash, answer: undefined });
    }
  }

  public answer(answer: Answer): void {
    const existing_answer = this.data.get(answer.hash);
    if (existing_answer == null) {
      return;
    }

    existing_answer.resolve(answer);
  }

  public ask(question: Question): Promise<Answer> {
    if (this.ignore_all) {
      return Promise.resolve({ hash: question.hash, answer: undefined });
    }
  
    const existing_answer = this.data.get(question.hash);
    if (existing_answer != null) {
      return existing_answer.promise;
    }

    const new_answer = Promise.withResolvers<Answer>();
    this.data.set(question.hash, new_answer);
    this.emit("ask", question);
    return new_answer.promise;
  }
}