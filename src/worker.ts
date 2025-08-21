import { Runner } from "./system/runner/Runner";
import { z } from "zod/v4";
import { Settings, SettingsData } from "./shared/settings";
import { WorkerResponse } from "./shared/worker/response";
import { expose } from "threads/worker";
import { Observable } from "observable-fns";
import { Answer } from "./shared/worker/request";
import { bad, Reply } from "./shared/reply";
// import { workerData } from "node:worker_threads";
// import { bad, good, Reply } from "./shared/reply";
// import { State } from "./system/State";

/** ------------------------------------------------------------------------- */

// export class API {
//   private settings_path: string;
//   private state: Maybe<State>;

//   constructor(settings_path: string) {
//     this.settings_path = settings_path;
//   }

//   async refreshSettings(): Promise<Reply> {
//     const settings = await Settings.fromFile(this.settings_path);
//     if (settings.ok) {
//       this.state = new State(settings.data);
//       await this.state.load();
//       return good(undefined);
//     } else {
//       this.state = null;
//       return settings;
//     }
//   }

//   async saveAnswer(answer: Answer) {
//     if (this.state == null) {
//       return bad("Settings are improper!");
//     }

//     const table = this.state.references.get(answer.reference);
//     table.insert([answer.answer]);
//     await table.save();
//   }
// }

// const api = new API(workerData)

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
let settings_data: Reply<SettingsData> = bad("Not loaded!");

const SYSTEM = {
  async saveAnswer(answer: Answer) {
    if (runner == null) {
      console.log("Runner does not exist!");
      return;
    }

    await runner.references.gather();
    await runner.references.load();
    const table = runner.references.get(answer.reference);
    table.insert([answer.answer]);
    await table.save();
  },

  setSettings(data: Reply<SettingsData>) {
    settings_data = data;

    if (settings_data.ok) {
      const settings = Settings.from(settings_data.data);
      if (settings.ok) {
        runner = new Runner(settings.data);
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