declare module "*.md";

interface Row {
  table: Table;
  data: string[];
}

interface Table {
  path: string;
  data: Row[];
}

interface FileData {
  path: string;
  raw: Buffer;
}

interface TransformerResult {
  start: number;
  end: number;
  name: string;
}

interface DiscrepencyResult {
  name: string;
  take: Rebate[];
  drop: Rebate[];
}

interface RunResults {
  config: TransformerResult[];
  discrepency: Maybe<DiscrepencyResult[]>;
}

type Maybe<T> = T | undefined | null;
