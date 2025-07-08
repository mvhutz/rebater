import { parentPort } from "node:worker_threads";
import Settings from "./shared/settings";
import { BasicState } from "./system/information/State";
import { Runner } from "./system/Runner";
import { z } from "zod/v4";

/** ------------------------------------------------------------------------- */

parentPort?.on("message", async message => {
  try {
    parentPort?.postMessage({ type: "running", progress: 0 });
    const settings = Settings.parse(message);
    const time: Time = { quarter: 4, year: 2024 };
    const state = new BasicState(time, settings);
    const runner = new Runner({ onStatus: s => parentPort?.postMessage(s) });

    await runner.run(state);
  } catch (error) {
    if (error instanceof z.ZodError) {
      parentPort?.postMessage({ type: "error", message: z.prettifyError(error) });
    } else if (error instanceof Error) {
      parentPort?.postMessage({ type: "error", message: error.stack });
    } else {
      parentPort?.postMessage({ type: "error", message: `${error}` });
    }
  }
});
