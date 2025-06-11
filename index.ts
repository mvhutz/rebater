// import { ZodError } from "zod";
import { /*fromExcel,*/ fromPDF } from "./src/convert";
import { getCustomersFile } from "./src/customers";
import { loadSupplier, parseRow } from "./src/parser";

async function main() {
  const customers = await getCustomersFile("data/Customers.json");
  const sheet = await fromPDF('data/2024/EcoSurfaces/Q2 2024 Rebate - Fuse.pdf');
  // console.log(JSON.stringify(sheet));
  const supplier = await loadSupplier('examples/eco_surfaces.json');

  const context = { counters: {}, customers };

  const rebates = await Promise.all(sheet.map(async (row, i) => {
    try {
      return await parseRow(row, context, supplier);
    } catch (err) {
      console.log(`ERROR ROW ${i}: ${err}`);
    }
  }));
  
  console.log(rebates);
}

void main();