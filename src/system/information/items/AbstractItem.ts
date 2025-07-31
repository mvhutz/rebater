export abstract class AbstractItem<Data> {
  protected data: Data;
  
  protected constructor(initial: Data) {
    this.data = initial;
  }

  abstract hash(): string;
  abstract save(): Promise<void>;
  abstract insert(datum: Data): void;

  public push(...data: Data[]) {
    for (const datum of data) {
      this.insert(datum);
    }
  }

  public add(...others: AbstractItem<Data>[]) {
    for (const other of others) {
      this.push(other.data);
    }
  }

  protected abstract fetch(): Promise<Data>;

  public async load(): Promise<void> {
    this.data = await this.fetch();
  }

  public getData(): Data {
    return this.data;
  }
}