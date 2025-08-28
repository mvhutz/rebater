import { Runner } from "./system/runner/Runner";
import { z } from "zod/v4";
import { WorkerResponse } from "./shared/worker/response";
import { expose } from "threads/worker";
import { Observable } from "observable-fns";
import { Answer } from "./shared/worker/request";
import { Repository } from "./shared/state/Repository";
import { workerData } from "worker_threads";

/** ------------------------------------------------------------------------- */

/**
 * Send an error to the main thread.
 * @param message The error to send.
 */
function sendError(message?: string): WorkerResponse {
  return { type: "status", status: { type: "error", message } };
}

/** ------------------------------------------------------------------------- */

console.log("DATA", workerData);
const repository = new Repository(workerData);

const SYSTEM = {
  async saveAnswer(answer: Answer) {
    const state_reply = repository.getState();
    if (!state_reply.ok) {
      console.log("Runner does not exist!");
      return;
    }
    
    const { data: state } = state_reply;

    const table = state.references.getTable(answer.reference);
    const modified = table.insert(answer.answer);
    await state.references.updateTable(answer.reference, modified);
  },

  /**
   * Run the program.
   */
  run(): Observable<WorkerResponse> {
    return new Observable(observer => {
      const state_reply = repository.getState();
      // Get settings.
      if (!state_reply.ok) {
        observer.next(sendError("State not loaded!"));
        observer.complete();
        return;
      }

      const { data: state } = state_reply;

      const settings_reply = repository.getSettings();
      // Get settings.
      if (!settings_reply.ok) {
        observer.next(sendError("Settings not loaded!"));
        observer.complete();
        return;
      }

      const { data: settings } = settings_reply;
      
      // Create runner.
      const runner = new Runner(state, settings);
      runner.on("status", status => observer.next({ type: "status", status }));

      // Run it.
      runner.run()
        .catch(async error => {
          if (runner == null) return;

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