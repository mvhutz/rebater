import * as ETL from './src/etl';
import { compareRebates } from './src/test';

const HEADERS = [
    "purchaseId",
    "transactionDate",
    "supplierId","memberId",
    "distributorName",
    "purchaseAmount",
    "rebateAmount",
    "invoiceId",
    "invoiceDate",
  ];

async function main() {
  const files = ETL.join(
    ETL.label({ give: ["United States"] },
      await ETL.read({ type: 'sources', category: 'American Olean-US' })
    ),
    ETL.label({ give: ["Canada"] },
      await ETL.read({ type: 'sources', category: 'American Olean-CA' })
    )
  );

  const rows = ETL.slice({ },
    ETL.trim({ top: 1 },
      ETL.sheet({ name: 'Detail' },
        ETL.excel(
          ETL.label({ take: ["United States"] }, files)
        )
      )
    )
  );
  
  const output = await ETL.write({ type: "rebates", category: "American Olean", headers: HEADERS },
    ETL.stack(
      ETL.table( 
        ETL.row([
          ETL.counter(rows),
          ETL.date(
            ETL.column({ index: 26 }, rows)
          ),
          ETL.literal({ value: "1058" }, rows),
          await ETL.reference({ table: "customers", enter: "customerName", exit: "fuseId" },
            ETL.column({ index: 11 }, rows)
          ),
          await ETL.reference({ table: "suppliers", enter: "fuseId", exit: "supplierName" },
            await ETL.reference({ table: "distributors", enter: "distributorName", exit: "distributorId" },
              ETL.column({ index: 8 }, rows)
            ),
          ),
          ETL.dollars(
            ETL.column({ index: 27 }, rows)
          ),
          ETL.dollars(
            ETL.column({ index: 30 }, rows)
          ),
          ETL.number(
            ETL.column({ index: 31 }, rows)
          ),
          ETL.date(
            ETL.column({ index: 26 }, rows)
          )
        ])
      )
    )
  );
  
  /** ---------- */

  await compareRebates(output[0].path, "data/rebates/American Olean/ANSWER.csv", { ignore: ["purchaseId"] });
}

main();