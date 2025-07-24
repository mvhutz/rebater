import { parentPort, workerData } from "node:worker_threads";
import { Runner } from "./system/Runner";
import { z } from "zod/v4";
import assert from "node:assert";
import { Settings } from "./shared/settings";
import { SystemStatus, WorkerResponse } from "./shared/worker/response";
// import { WorkerRequestSchema } from "./shared/worker/request";
import { randomUUID } from "node:crypto";

/** ------------------------------------------------------------------------- */

const QUESTIONS = new Map<string, string>();

/** ------------------------------------------------------------------------- */

assert.ok(parentPort != null, "Not initialized as worker!");
const parent = parentPort;

/** ------------------------------------------------------------------------- */

function sendStatus(status: SystemStatus) {
  parent.postMessage({ type: "status", status } as WorkerResponse);
}

function sendQuestion(question: string, hash: string) {
  parent.postMessage({ type: "question", question, hash } as WorkerResponse);
}

// parent.on("message", async message => {
//   try {
//     const request = WorkerRequestSchema.parse(message);
//     switch (request.type) {
//       case "answer": await onAnswer(request.answer);
//     }
//   } catch (error) {
//     if (error instanceof z.ZodError) {
//       return sendStatus({ type: "error", message: z.prettifyError(error) });
//     } else if (error instanceof Error) {
//       return sendStatus({ type: "error", message: error.message });
//     } else {
//       return sendStatus({ type: "error", message: `${error}` });
//     }
//   }
// });

export async function main(data: unknown) {
  try {
    const settings_parse = Settings.from(data);
    if (!settings_parse.ok) {
      return sendStatus({ type: "error", message: settings_parse.reason });
    }

    const runner = new Runner();

    runner.on("status", status => {
      sendStatus(status);
    });

    runner.on("question", question => {
      const hash = randomUUID();
      QUESTIONS.set(hash, question);
      sendQuestion(question, hash);
    })

    await runner.run(settings_parse.data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return sendStatus({ type: "error", message: z.prettifyError(error) });
    } else if (error instanceof Error) {
      return sendStatus({ type: "error", message: error.message });
    } else {
      return sendStatus({ type: "error", message: `${error}` });
    }
  }
}

main(workerData);
