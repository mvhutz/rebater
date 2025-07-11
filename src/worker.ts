import { parentPort } from "node:worker_threads";
import { Runner } from "./system/Runner";
import { z } from "zod/v4";
import { makeSettingsInterface } from "./shared/settings_interface";
import { Settings } from "./shared/settings";
import assert from "node:assert";
import { WorkerRequestSchema } from "./shared/worker_message";
import { SystemStatus } from "./shared/system_status";

/** ------------------------------------------------------------------------- */

interface WorkerState {
  running: boolean;
  answerer?: (answer?: string) => void;
}

const STATE: WorkerState = {
  running: false,
  answerer: undefined
};

/** ------------------------------------------------------------------------- */

assert.ok(parentPort != null, "Not initialized as worker!");
const parent = parentPort;

function send(status: SystemStatus) {
  parent.postMessage(status);
}

function onQuestion(question: string): Promise<Maybe<string>> {
  return new Promise((res, rej) => {
    if (STATE.answerer != null) {
      rej("The system cannot answer two questions at once.");
    }

    STATE.answerer = answer => {
      STATE.answerer = undefined;

      res(answer);
    }

    send({ type: "asking", question });
  })
}

async function onStart(settings: Settings) {
  if (STATE.running) {
    send({ type: "error", message: "Worker already running!" });
    return;
  }

  STATE.running = true;

  {
    const settings_interface = makeSettingsInterface(settings);
    if (!settings_interface.ok) {
      send({ type: "error", message: settings_interface.reason });
      return;
    }

    const runner = new Runner({
      onStatus: s => parent.postMessage(s),
      onQuestion
    });

    await runner.run(settings_interface.data);
  }

  STATE.running = false;
}

async function onAnswer(answer?: string) {
  if (STATE.answerer == null) {
    send({ type: "error", message: "The system didn't ask." });
    return;
  }

  STATE.answerer(answer);
  STATE.answerer = undefined;
}

parent.on("message", async message => {
  try {
    const request = WorkerRequestSchema.parse(message);
    if (request.type === "start") await onStart(request.settings);
    if (request.type === "answer") await onAnswer(request.answer);

  } catch (error) {
    STATE.running = false;
    if (error instanceof z.ZodError) {
      send({ type: "error", message: z.prettifyError(error) });
    } else if (error instanceof Error) {
      send({ type: "error", message: error.message });
    } else {
      send({ type: "error", message: `${error}` });
    }
  }
});
