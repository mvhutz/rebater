import { parentPort, workerData } from "node:worker_threads";
import { Runner } from "./system/runner/Runner";
import { z } from "zod/v4";
import assert from "node:assert";
import { Settings } from "./shared/settings";
import { WorkerResponse } from "./shared/worker/response";
import { WorkerRequest, WorkerRequestSchema } from "./shared/worker/request";

/** ------------------------------------------------------------------------- */

// Make sure this is actually a worker thread.
assert.ok(parentPort != null, "Not initialized as worker!");
const parent = parentPort;

/** ------------------------------------------------------------------------- */

/**
 * Send a message to the main thread.
 * @param response The message to send.
 */
function send(response: WorkerResponse) {
  parent.postMessage(response);
}

/**
 * Send an error to the main thread.
 * @param message The error to send.
 */
function sendError(message?: string) {
  send({ type: "status", status: { type: "error", message } });
}

/**
 * Handle a message from the main thread.
 * @param fn The handler.
 */
function onReceive(fn: (message: WorkerRequest) => Promise<void>) {
  parent.on("message", message => {
    const request_parse = WorkerRequestSchema.safeParse(message);
    if (!request_parse.success) {
      return sendError(z.prettifyError(request_parse.error));
    }

    fn(request_parse.data);
  });
}

/** ------------------------------------------------------------------------- */

/**
 * Run the program.
 */
function main() {
  // Get settings.
  const settings_reply = Settings.from(workerData);
  if (!settings_reply.ok) return sendError(settings_reply.reason);
  
  // Create runner.
  const runner = new Runner(settings_reply.data);
  runner.on("status", status => send({ type: "status", status }));
  runner.asker.on("ask", question => send({ type: "question", ...question }));

  // Handle messages from main.
  onReceive(async request => {
    switch (request.type) {
      case "answer":
        runner.asker.answer(request);
        break;
      case "exit":
        runner.asker.ignoreAll();
        runner.stop();
        break;
      case "ignore_all":
        runner.asker.ignoreAll();
        break;
    }
  })

  // Run it.
  runner.run()
    .catch(async error => {
      await runner.save();
      if (error instanceof z.ZodError) {
        return sendError(z.prettifyError(error));
      } else if (error instanceof Error) {
        return sendError(error.message);
      } else {
        return error(`${error}`);
      }
    });
}

/** ------------------------------------------------------------------------- */

main();