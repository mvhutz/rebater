export class Row {
  private readonly data: string[];

  private constructor(data: string[]) {
    this.data = data;
  }

  public get(index: number): Maybe<string> {
    return this.data[index];
  }

  public static of(...data: string[]) {
    return new Row(data);
  }

  public static add(...rows: Row[]) {
    const total: string[] = [];

    for (const row of rows) {
      total.push(...row.data);
    }

    return new Row(total);
  }
}

export class Table {
  private constructor(data: string[][]) {
    
  }
}