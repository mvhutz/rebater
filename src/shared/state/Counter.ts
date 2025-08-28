
/**
 * Stores any counters used by the Transformers.
 */
export class Counter {
  public static readonly INITIAL_COUNTER_VALUE = 0;
  private values: Record<string, number> = {};

  /**
   * Get a counter by its name.
   * @param name The name of the counter.
   * @returns The first counter that matches the name.
   */
  public getValue(name: string): number {
    this.values[name] ??= Counter.INITIAL_COUNTER_VALUE;
    return this.values[name];
  }

  /**
   * Increment a certain counter.
   * @param name The name of the counter.
   */
  public increment(name: string): void {
    this.values[name] ??= Counter.INITIAL_COUNTER_VALUE
    this.values[name]++;
  }
  
  /**
   * Get the current value of a counter, and then increment it.
   * @param name The name of the counter.
   * @returns The value before incrementing.
   */
  public getThenIncrement(name: string): number {
    const value = this.getValue(name);
    this.increment(name);

    return value;
  }
}
