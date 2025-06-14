namespace ETL {
  interface Atom {
    labels: Set<string>;
  }

  interface File extends Atom {
    type: "file";
    path: string;
  }

  interface Workbook extends Atom {
    type: "workbook";
    workbook: XLSX.WorkBook;
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

  interface ReferenceTable extends Atom {
    type: "table";
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

  type Data = File | Workbook | Table | Row | ReferenceTable | Cell;

  interface Action {
    name: string;
  }

  interface Process<T extends Action = Action> {
    id: symbol
    name?: string;
    dependents: Set<symbol>;
    action: T;
  }

  type Transformer = Map<symbol, Process>;
}