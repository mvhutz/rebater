import { compareRebate, fetchRebates } from "./src/extract";

async function main() {
  await fetchRebates(
    'data/American Olean-US/supplier.json',
    "data/customers.json",
    'data/American Olean-US/Q4-2024-GUESS.csv'
  );

  await compareRebate(
    'data/American Olean-US/Q4-2024-ANSWER.csv',
    'data/American Olean-US/Q4-2024-GUESS.csv'
  );
}

void main();