import EventEmitter from "events";

/** ------------------------------------------------------------------------- */

interface AskerEvents {
  ask: [string]
}

export class Asker extends EventEmitter<AskerEvents> {
  private data = new Map<string, PromiseWithResolvers<Maybe<string>>>();
  private ignore_all = false;

  public ignoreAll() {
    this.ignore_all = true;

    for (const [, resolvers] of this.data) {
      resolvers.resolve(undefined);
    }
  }

  public answer(question: string, answer?: string): void {
    const existing_answer = this.data.get(question);
    if (existing_answer == null) {
      return;
    }

    existing_answer.resolve(answer);
  }

  public ask(question: string): Promise<Maybe<string>> {
    if (this.ignore_all) {
      return Promise.resolve(undefined);
    }
  
    const existing_answer = this.data.get(question);
    if (existing_answer != null) {
      return existing_answer.promise;
    }

    const new_answer = Promise.withResolvers<Maybe<string>>();
    this.data.set(question, new_answer);
    this.emit("ask", question);
    return new_answer.promise;
  }
}