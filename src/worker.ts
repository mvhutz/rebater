import { parentPort, workerData } from "node:worker_threads";
import { Runner } from "./system/runner/Runner";
import { z } from "zod/v4";
import assert from "node:assert";
import { Settings } from "./shared/settings";
import { SystemStatus, WorkerResponse } from "./shared/worker/response";
import { WorkerRequestSchema } from "./shared/worker/request";

/** ------------------------------------------------------------------------- */

assert.ok(parentPort != null, "Not initialized as worker!");
const parent = parentPort;

/** ------------------------------------------------------------------------- */

function sendStatus(status: SystemStatus) {
  parent.postMessage({ type: "status", status } as WorkerResponse);
}

function sendQuestion(question: string) {
  parent.postMessage({ type: "question", question } as WorkerResponse);
}

export async function main(data: unknown) {
  const settings_parse = Settings.from(data);
  if (!settings_parse.ok) {
    return sendStatus({ type: "error", message: settings_parse.reason });
  }

  const runner = new Runner(settings_parse.data);

  runner.on("status", sendStatus);
  runner.state.asker.on("ask", sendQuestion);

  parent.on("message", async message => {
    const request_parse = WorkerRequestSchema.safeParse(message);
    if (!request_parse.success) {
      return sendStatus({ type: "error", message: z.prettifyError(request_parse.error) });
    }

    const { data } = request_parse;

    switch (data.type) {
      case "answer":
        runner.state.asker.answer(data.question, data.answer);
        break;
      case "exit":
        runner.stop();
        break;
      case "ignore_all":
        runner.state.asker.ignoreAll();
    }
  });

  await runner.run();
}

/** ------------------------------------------------------------------------- */

main(workerData)
  .catch(error => {
    if (error instanceof z.ZodError) {
      return sendStatus({ type: "error", message: z.prettifyError(error) });
    } else if (error instanceof Error) {
      return sendStatus({ type: "error", message: error.message });
    } else {
      return sendStatus({ type: "error", message: `${error}` });
    }
  });
