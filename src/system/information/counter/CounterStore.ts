import { Counter } from "./Counter";

export class CounterStore {
  private counters = new Map<string, Counter>();
  public readonly initial?: number;

  public constructor(initial?: number) {
    this.initial = initial;
  }

  public get(name: string): Counter {
    const counter = this.counters.get(name);
    if (counter == null) {
      const new_counter = new Counter(this.initial);
      this.counters.set(name, new_counter);
      return new_counter;
    }

    return counter;
  }
}
