import { Runner } from "./system/runner/Runner";
import { z } from "zod/v4";
import { Settings, SettingsData } from "./shared/settings";
import { WorkerResponse } from "./shared/worker/response";
import { expose } from "threads/worker";
import { Observable } from "observable-fns";
import { Answer } from "./shared/worker/request";
import { bad, Reply } from "./shared/reply";
import { State } from "./shared/state";

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
let state: Maybe<State>;
let settings_data: Reply<SettingsData> = bad("Not loaded!");

const SYSTEM = {
  async saveAnswer(answer: Answer) {
    if (state == null) {
      console.log("Runner does not exist!");
      return;
    }

    await state.references.gather();
    await state.references.load();
    const table = state.references.get(answer.reference);
    table.insert([answer.answer]);
    await table.save();
  },

  async setSettings(data: Reply<SettingsData>) {
    settings_data = data;

    if (settings_data.ok) {
      const settings = Settings.from(settings_data.data);
      if (settings.ok) {
        state = new State(settings.data);
      } else {
        runner = null;
      }
    } else {
      runner = null;
    }
  },

  /**
   * Run the program.
   */
  run(): Observable<WorkerResponse> {
    return new Observable(observer => {
      // Get settings.
      if (runner == null) {
        observer.next(sendError("Runner not loaded!"));
        observer.complete();
        return;
      }
      
      // Create runner.
      runner.on("status", status => observer.next({ type: "status", status }));

      // Run it.
      runner.run()
        .catch(async error => {
          if (runner == null) return;

          await runner.state.save();
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