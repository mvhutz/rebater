import { Runner } from "./system/runner/Runner";
import { z } from "zod/v4";
import { Settings, SettingsData } from "./shared/settings";
import { WorkerResponse } from "./shared/worker/response";
import { expose } from "threads/worker";
import { Observable } from "observable-fns";

/** ------------------------------------------------------------------------- */

/**
 * Send an error to the main thread.
 * @param message The error to send.
 */
function sendError(message?: string): WorkerResponse {
  return { type: "status", status: { type: "error", message } };
}

/** ------------------------------------------------------------------------- */

const SYSTEM = {
  /**
   * Run the program.
   */
  run(data: Maybe<SettingsData>): Observable<WorkerResponse> {
    return new Observable(observer => {
      // Get settings.
      const settings_reply = Settings.from(data);
      if (!settings_reply.ok) {
        observer.next(sendError(settings_reply.reason));
        observer.complete();
        return;
      }
      
      // Create runner.
      const runner = new Runner(settings_reply.data);
      runner.on("status", status => observer.next({ type: "status", status }));
      runner.on("ask", question => observer.next({ type: "question", ...question }));

      // Run it.
      runner.run()
        .catch(async error => {
          await runner.save();
          if (error instanceof z.ZodError) {
            return observer.next(sendError(z.prettifyError(error)));
          } else if (error instanceof Error) {
            return observer.next(sendError(error.message));
          } else {
            return observer.next(error(`${error}`));
          }
        });
    })
  }
}

/** ------------------------------------------------------------------------- */

export type System = typeof SYSTEM;
expose(SYSTEM);