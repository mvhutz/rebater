import { Runner } from "./system/runner/Runner";
import { z } from "zod/v4";
import { Settings, SettingsData } from "./shared/settings";
import { WorkerResponse } from "./shared/worker/response";
import { expose } from "threads/worker";
import { Observable } from "observable-fns";
import { Answer } from "./shared/worker/request";

/** ------------------------------------------------------------------------- */

/**
 * Send an error to the main thread.
 * @param message The error to send.
 */
function sendError(message?: string): WorkerResponse {
  return { type: "status", status: { type: "error", message } };
}

/** ------------------------------------------------------------------------- */

let runner: Maybe<Runner>;

const SYSTEM = {
  async saveAnswer(answer: Answer) {
    if (runner == null) {
      console.log("Runner does not exist!");
      return;
    }
    const table = runner.references.get(answer.reference);
    table.insert([answer.answer]);
    await table.save();
  },

  /**
   * Run the program.
   */
  run(data: SettingsData): Observable<WorkerResponse> {
    return new Observable(observer => {
      // Get settings.
      const settings_reply = Settings.from(data);
      if (!settings_reply.ok) {
        observer.next(sendError(settings_reply.reason));
        observer.complete();
        return;
      }
      
      // Create runner.
      runner = new Runner(settings_reply.data);
      runner.on("status", status => observer.next({ type: "status", status }));
      runner.on("ask", question => observer.next({ type: "question", ...question }));

      // Run it.
      runner.run()
        .catch(async error => {
          if (runner == null) return;

          await runner.save();
          if (error instanceof z.ZodError) {
            observer.next(sendError(z.prettifyError(error)));
          } else if (error instanceof Error) {
            observer.next(sendError(error.message));
          } else {
            observer.next(error(`${error}`));
          }

          observer.complete();
        })
        .then(() => {
          observer.complete();
        });
    })
  }
}

/** ------------------------------------------------------------------------- */

export type System = typeof SYSTEM;
expose(SYSTEM);