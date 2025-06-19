interface Reference {
  path: string;
  data: Record<string, string>[];
}

interface Context {
  quarter: number,
  year: number,
  counter: number;
  directory: string;
  references: Map<string, Reference>;
}

interface Row {
  data: string[];
}

interface Table {
  path: string;
  data: Row[];
}

interface ConfigResult {
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
  config: ConfigResult[];
  discrepency: DiscrepencyResult[];
}