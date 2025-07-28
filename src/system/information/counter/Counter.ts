export class Counter {
  public static readonly INITIAL_COUNTER_VALUE = 0;
  private amount: number;

  constructor(initial: number = Counter.INITIAL_COUNTER_VALUE) {
    this.amount = initial;
  }

  public get(): number {
    return this.amount;
  }

  public increment(): void {
    this.amount++;
  }

  public getThenIncrement(): number {
    const n = this.get();
    this.increment();

    return n;
  }
}
