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

type Maybe<T> = T | undefined | null;
