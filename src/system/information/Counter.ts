export class Counter {
  public static readonly INITIAL_COUNTER_VALUE = 0;
  private values: Record<string, number> = {};

  public getValue(name: string): number {
    this.values[name] ??= Counter.INITIAL_COUNTER_VALUE;
    return this.values[name];
  }

  public increment(name: string): void {
    this.values[name] ??= Counter.INITIAL_COUNTER_VALUE
    this.values[name]++;
  }

  public getThenIncrement(name: string): number {
    const n = this.getValue(name);
    this.increment(name);

    return n;
  }
}
