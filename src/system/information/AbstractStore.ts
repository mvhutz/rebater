export abstract class AbstractItem<T> {
  protected data: T;
  
  protected constructor(initial: T) {
    this.data = initial;
  }

  abstract hash(): string;
  abstract save(): Promise<void>;
  abstract insert(datum: T): void;

  public push(...data: T[]) {
    for (const datum of data) {
      this.insert(datum);
    }
  }

  public add(...others: AbstractItem<T>[]) {
    for (const other of others) {
      this.push(other.data);
    }
  }

  protected abstract fetch(): Promise<T>;

  public async load(): Promise<void> {
    this.data = await this.fetch();
  }

  public getData(): T {
    return this.data;
  }
}

/** ------------------------------------------------------------------------- */

export abstract class AbstractStore<I extends AbstractItem<J>, J, T> {
  protected items = new Map<string, I>();
  public readonly meta: T;

  public constructor(meta: T) {
    this.meta = meta;
  }

  public wipe(): void {
    this.items.clear();
  }

  public getItems(): I[] {
    return this.items.values().toArray();
  }

  public async save(): Promise<void> {
    await Promise.all(this.getItems().map(async d => {
      await d.save();
    }))
  }

  public filter(fn: (item: I) => boolean) {
    return this.getItems().filter(fn);
  }

  public add(item: I): boolean {
    const current = this.items.get(item.hash());

    if (current != null) {
      return false;
    } else {
      this.items.set(item.hash(), item);
    }

    return true;
  }

  public async load(): Promise<void> {
    await Promise.all(this.getItems().map(i => {
      return i.load();
    }))
  }

  public abstract gather(): Promise<void>;
}