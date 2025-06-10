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

interface Customer {
  supplierName: string;
  category: string;
  customerName: string;
  internalId: string;
  fuseId: number;
}

type CustomerTable = Customer[];
