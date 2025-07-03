export interface State {
  amount: number;
}

export abstract class Counter {
  public abstract get(): number;
  public abstract increment(): void;
}

export class BasicCounter extends Counter {
  private amount: number;

  constructor(initial: number) {
    super();

    this.amount = initial;
  }

  public get(): number {
    return this.amount;
  }

  public increment(): void {
    this.amount++;
  }
}
