import { BasicState } from "./app/src/api/information/State";
import { BasicSettings } from "./app/src/api/information/Settings";
import { CLIRunner } from "./app/src/api/runner/CLIRunner";

/** ------------------------------------------------------------------------- */

async function main() {
  const time = { quarter: 4, year: 2024 } satisfies Time;
  const settings = new BasicSettings("./data");
  const state = new BasicState(time, settings);
  const runner = new CLIRunner();

  runner.run(state);
}

void main();
