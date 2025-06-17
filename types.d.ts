import type { WorkBook } from "xlsx";

type FilterByPropertyType<T, K extends keyof T, V> = T extends { [P in K]: V } ? T : never;

export namespace ETL {
  interface Atom {
    labels: Set<string>;
  }

  interface File extends Atom {
    type: "file";
    path: string;
  }

  interface Workbook extends Atom {
    type: "workbook";
    workbook: WorkBook;
  }

  interface Table extends Atom {
    type: "table";
    data: string[][];
    table: string;
  }

  interface Row extends Atom {
    type: "row";
    data: string[];
    table: string;
    row: number;
  }

  interface ReferenceTable {
    type: "reference";
    path: string;
    data: Record<string, string>[];
    name: string;
  }

  interface Cell extends Atom {
    type: "cell";
    data: string;
    table: string;
    row: number;
    column: number;
  }

  type Data = File | Workbook | Table | Row | Cell;

  type Filter<T> = FilterByPropertyType<Data, "type", T>

  interface Action {
    type: string;
    [T: string]: unknown;
  }

  interface Process<T extends Action = Action> {
    id: symbol
    name?: string;
    dependencies: Set<symbol>;
    action: T;
  }

  type Transformer = Map<symbol, Process>;
}

type A = 1 | 2 | 3 | 4;

type B = 1 | 2 | 3;

type C = B extends A ? true : false;