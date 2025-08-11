import assert from "node:assert";


export class Row {
  public readonly source: string;
  private readonly data: string[];

  public constructor(data: string[], source: string) {
    this.source = source;
    this.data = data;
  }

  public get(index: number): Maybe<string> {
    return this.data[index];
  }

  public split(): readonly string[] {
    return this.data;
  }

  public set(index: number, value: string): Row {
    const copy = [...this.data];
    copy[index] = value;

    return new Row(copy, this.source);
  }

  public static add(...rows: Row[]) {
    const total: string[] = [];

    for (const row of rows) {
      total.push(...row.data);
    }

    return new Row(total, "<dynamic>");
  }

  public update(fn: (value: string, index: number) => string): Row {
    return new Row(this.data.map(fn), this.source);
  }

  public size(): number {
    return this.data.length;
  }
}

export class Table {
  private readonly data: Row[];

  private constructor(data: Row[]) {
    this.data = data;
  }

  public get(index: number): Maybe<Row> {
    return this.data[index];
  }

  public update(fn: (value: Row, index: number) => Maybe<Row>): Table {
    return new Table(this.data.map(fn).filter(r => r != null));
  }

  public async updateAsync(fn: (value: Row, index: number) => Promise<Maybe<Row>>): Promise<Table> {
    return new Table((await Promise.all(this.data.map(fn))).filter(r => r != null));
  }

  public split(): readonly Row[] {
    return this.data;
  }

  public slice(from?: number, to?: number): Table {
    return new Table(this.data.slice(from, to));
  }

  public static join(...rows: Row[]) {
    return new Table(rows);
  }

  public static stack(...rows: Table[]) {
    const result = [];

    for (const row of rows) {
      result.push(...row.data);
    }

    return new Table(result);
  }

  public divide(fn: (row: Row) => string): Map<string, Table> {
    const matched = new Map<string, Table>();
    for (const row of this.data) {
      const hash = fn(row);
      const list = matched.get(hash);

      if (list == null) {
        matched.set(hash, Table.join(row));
      } else {
        list.push(row);
      }
    }

    return matched;
  }

  public push(...rows: Row[]) {
    return new Table([...this.data, ...rows]);
  }

  public prepend(...rows: Row[]) {
    return new Table([...rows, ...this.data]);
  }

  public filter(fn: (row: Row) => boolean): Table {
    return new Table(this.data.filter(fn));
  }

  public async filterAsync(fn: (row: Row) => Promise<boolean>): Promise<Table> {
    const valid = new Array<Row>();

    for (const row of this.data) {
      const keep = await fn(row);
      if (keep) {
        valid.push(row);
      }
    }

    return new Table(valid);
  }

  public transpose(): Table {
    const trans = [];
    for (let i = 0; i < this.data[0].size(); i++) {
      const data = [];

      for (const row of this.data) {
        const datum = row.get(i);
        assert.ok(datum != null, `Rows in table have uneven lengths!`);

        data.push(datum);
      }
      
      trans.push(new Row(data, "<dynamic>"));
    }
    
    return new Table(trans);
  }
}