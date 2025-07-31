import { parentPort, workerData } from "node:worker_threads";
import { Runner } from "./system/runner/Runner";
import { z } from "zod/v4";
import assert from "node:assert";
import { Settings } from "./shared/settings";
import { WorkerResponse } from "./shared/worker/response";
import { WorkerRequest, WorkerRequestSchema } from "./shared/worker/request";

/** ------------------------------------------------------------------------- */

assert.ok(parentPort != null, "Not initialized as worker!");
const parent = parentPort;

/** ------------------------------------------------------------------------- */

function send(response: WorkerResponse) {
  parent.postMessage(response);
}

function sendError(message?: string) {
  send({ type: "status", status: { type: "error", message } });
}

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

function main() {
  const settings_reply = Settings.from(workerData);
  if (!settings_reply.ok) return sendError(settings_reply.reason);

  const runner = new Runner(settings_reply.data);

  runner.on("status", status => send({ type: "status", status }));
  runner.asker.on("ask", question => send({ type: "question", question }));

  onReceive(async request => {
    switch (request.type) {
      case "answer":
        runner.asker.answer(request.question, request.answer);
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

  runner.run()
    .catch(error => {
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