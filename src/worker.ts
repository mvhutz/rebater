import { parentPort, workerData } from "node:worker_threads";
import { Runner } from "./system/Runner";
import { z } from "zod/v4";
import { makeSettingsInterface } from "./shared/settings_interface";
import { SettingsSchema } from "./shared/settings";
import assert from "node:assert";
import { WorkerRequestSchema } from "./shared/worker_message";
import { SystemStatus } from "./shared/system_status";

/** ------------------------------------------------------------------------- */

interface WorkerState {
  answerer?: (answer?: string) => void;
}

const STATE: WorkerState = {
  answerer: undefined
};

/** ------------------------------------------------------------------------- */

assert.ok(parentPort != null, "Not initialized as worker!");
const parent = parentPort;

/** ------------------------------------------------------------------------- */

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

async function onAnswer(answer?: string) {
  if (STATE.answerer == null) {
    return send({ type: "error", message: "The system didn't ask." });
  }

  STATE.answerer(answer);
  STATE.answerer = undefined;
}

parent.on("message", async message => {
  try {
    const request = WorkerRequestSchema.parse(message);
    switch (request.type) {
      case "answer": await onAnswer(request.answer);
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return send({ type: "error", message: z.prettifyError(error) });
    } else if (error instanceof Error) {
      return send({ type: "error", message: error.message });
    } else {
      return send({ type: "error", message: `${error}` });
    }
  }
});

async function main() {
  try {
    const { success, data: settings, error } = SettingsSchema.safeParse(workerData);
    if (!success) {
      return send({ type: "error", message: z.prettifyError(error) });
    }

    const settings_interface = makeSettingsInterface(settings);
    if (!settings_interface.ok) {
      return send({ type: "error", message: settings_interface.reason });
    }

    const runner = new Runner({
      onStatus: s => parent.postMessage(s),
      onQuestion
    });

    await runner.run(settings_interface.data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return send({ type: "error", message: z.prettifyError(error) });
    } else if (error instanceof Error) {
      return send({ type: "error", message: error.message });
    } else {
      return send({ type: "error", message: `${error}` });
    }
  }
}

main();
