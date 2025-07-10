interface Time {
  quarter: 1 | 2 | 3 | 4;
  year: number;
}

interface Row {
  data: string[];
}

interface Table {
  path: string;
  data: Row[];
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
  discrepency: DiscrepencyResult[];
}

type Maybe<T> = T | undefined | null;
