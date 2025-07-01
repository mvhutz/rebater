import consola from "consola";
import mutexify from "mutexify/promise";

export class Handlers {
  private lock: ReturnType<typeof mutexify>;

  constructor() {
    this.lock = mutexify();
  }

  public async requestAsk() {
    return await this.lock();
  }

  public async ask(question: string): Promise<string> {
    const answer = await consola.prompt(question, {
      type: "text",
      cancel: "reject"
    });

    return answer;
  }
}