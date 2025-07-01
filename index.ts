// import consola from "consola";
import { runAllConfigs } from "./src/transformer";
import { printResults, pushToXLSX } from "./src/test";
// import mutexify from "mutexify/promise";
import { BasicState } from "./src/information/State";
import { BasicSettings } from "./src/information/Settings";

/** ------------------------------------------------------------------------- */

// const lock = mutexify();

// async function escalate(fn: () => void | Promise<void>) {
//   const release = await lock();
//   const output = await fn();
//   release();
//   return output;
// }

// async function askQuestion(text: string) {
//   const answer = await consola.prompt(text, {
//     type: "text",
//     cancel: "reject"
//   });

//   return answer;
// }

async function main() {
  const time = { quarter: 4, year: 2024 } satisfies Time;
  const settings = new BasicSettings("./data");
  const state = new BasicState(time, settings);

  const results = await runAllConfigs(state);
  printResults(results);

  pushToXLSX("data/OUTPUT.xlsx", state);
}

void main();
