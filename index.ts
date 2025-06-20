import consola from "consola";
import { runAllConfigs } from "./src/config";
import { printResults, pushToXLSX } from "./src/test";
import mutexify from "mutexify/promise";

/** ------------------------------------------------------------------------- */

const lock = mutexify();

async function escalate(fn: () => void | Promise<void>) {
  const release = await lock();
  const output = await fn();
  release();
  return output;
}

async function askQuestion(text: string) {
  const answer = await consola.prompt(text, {
    type: "text",
    cancel: "reject"
  });

  return answer;
}

async function main() {
  const context = {
    quarter: 4,
    year: 2024,
    counter: 0,
    directory: "data",
    references: new Map(),
    escalate: escalate,
    ask: askQuestion
  };

  const results = await runAllConfigs(context);
  printResults(results);

  pushToXLSX("data/OUTPUT.xlsx", context);
}

void main();
