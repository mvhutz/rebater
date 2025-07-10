import { parentPort } from "node:worker_threads";
import { BasicState } from "./system/information/State";
import { Runner } from "./system/Runner";
import { z } from "zod/v4";
import { makeSettingsInterface } from "./shared/settings_interface";
import { SettingsSchema } from "./shared/settings";

/** ------------------------------------------------------------------------- */

parentPort?.on("message", async message => {
  try {
    parentPort?.postMessage({ type: "running", progress: 0 });
    const settings = SettingsSchema.parse(message);
    const settings_interface = makeSettingsInterface(settings);
    if (!settings_interface.ok) {
      parentPort?.postMessage({ type: "error", message: settings_interface.reason });
      return;
    }

    const state = new BasicState(settings_interface.data);
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
