import { runAllConfigs } from "./src/config";
import { printResults } from "./src/test";

async function main() {
  const context = {
    quarter: 4,
    year: 2024,
    counter: 0,
    directory: "data",
    references: new Map(),
  };

  const results = await runAllConfigs(context);
  printResults(results);
}

void main();
