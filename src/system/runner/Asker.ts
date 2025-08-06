import EventEmitter from "events";
import { Question } from "../../shared/worker/response";
import { Answer } from "../../shared/worker/request";

/** ------------------------------------------------------------------------- */

/** The events emitted by the asker. */
interface AskerEvents {
  ask: [Question]
}

/**
 * An interface between the event-based messaging of the main thread, and the
 * `async`/`await` communication of the system.
 * 
 * Some transformers require input from the user during execution. But, you
 * cannot pause the execution of a promise. So, it is stalled using `async`/
 * `await`. But, the messaging of the main thread doesn't play nicely with
 * promises; it uses events.
 * 
 * This class is the solution. It allows the system to ask questions, and get
 * promises as results, and allows the main thread to listen to events (questions)
 * and return messages (answers).
 */
export class Asker extends EventEmitter<AskerEvents> {
  /** All questions, sorted by hash. */
  private data = new Map<string, PromiseWithResolvers<Answer>>();

  /**
   * If the user chooses to ignore all questions, they will immediately return
   * `null` instead.
   */
  private ignore_all = false;

  /**
   * Choose to ignore all current and future questions.
   */
  public ignoreAll() {
    this.ignore_all = true;

    for (const [hash, resolvers] of this.data) {
      resolvers.resolve({ hash, answer: undefined });
    }
  }

  /**
   * Allow the worker to answer a question.
   * @param answer The answer to a specific question.
   */
  public answer(answer: Answer): void {
    const existing_answer = this.data.get(answer.hash);
    if (existing_answer == null) {
      return;
    }

    existing_answer.resolve(answer);
  }

  /**
   * Allow the program to ask a question.
   * @param question The question to ask.
   * @returns A promise, which will resolve when the question is answered.
   */
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