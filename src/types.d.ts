interface Rebate {
  purchaseId: number;
  transactionDate: Date;
  supplierId: number;
  memberId: number;
  distributorName: string;
  purchaseAmount: number;
  rebateAmount: number;
  invoiceId: number;
  invoiceDate: number;
}

type RebateTable = Rebate[];
