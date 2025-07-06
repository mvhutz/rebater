import { parentPort } from "node:worker_threads";
import Settings from "./shared/settings";
import { BasicState } from "./system/information/State";
import { Runner } from "./system/Runner";

/** ------------------------------------------------------------------------- */

parentPort?.on("message", message => {
  parentPort?.postMessage({ type: "running", progress: 0 });

  const settings = Settings.parse(message);
  const time: Time = { quarter: 4, year: 2024 };
  const state = new BasicState(time, settings);
  const runner = new Runner({ onStatus: s => parentPort?.postMessage(s) });

  void (async () => {
    try {
      await runner.run(state);
    } catch (error) {
      const message = error instanceof Error ? error.stack : `${error}`;
      parentPort?.postMessage({ type: "error", message });
    }
  })();
});
