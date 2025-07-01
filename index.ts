import { BasicState } from "./src/information/State";
import { BasicSettings } from "./src/information/Settings";
import { Runner } from "./src/runner";

/** ------------------------------------------------------------------------- */

async function main() {
  const time = { quarter: 4, year: 2024 } satisfies Time;
  const settings = new BasicSettings("./data");
  const state = new BasicState(time, settings);
  const runner = new Runner();

  runner.run(state);
}

void main();
