export class Counter {
  public static readonly INITIAL_COUNTER_VALUE = 0;
  private amount: number;

  constructor(initial: number = Counter.INITIAL_COUNTER_VALUE) {
    this.amount = initial;
  }

  public get value(): number {
    return this.amount;
  }

  public increment(): void {
    this.amount++;
  }

  public getThenIncrement(): number {
    const n = this.value;
    this.increment();

    return n;
  }
}
