import { getCustomersFile } from "./src/customers";

async function main() {
  const customers = await getCustomersFile("data/Customers.json");
  console.log(customers);
}

void main();