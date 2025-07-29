export abstract class AbstractItem<T> {
  protected data: T;
  protected loaded: boolean;
  
  protected constructor(initial: T) {
    this.data = initial;
    this.loaded = false;
  }

  abstract hash(): string;
  abstract save(): Promise<void>;
  abstract append(o: AbstractItem<T>): void;
  protected abstract fetch(): Promise<T>;

  public async load(): Promise<void> {
    this.data = await this.fetch();
    this.loaded = true;
  }

  public getData(): Maybe<T> {
    if (this.loaded) {
      return this.data;
    } else {
      return null;
    }
  }
}

/** ------------------------------------------------------------------------- */

export abstract class AbstractStore<I extends AbstractItem<J>, J> {
  protected items = new Map<string, I>();

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

  public async add(item: I) {
    const current = this.items.get(item.hash());

    if (current != null) {
      current.append(item);
    } else {
      this.items.set(item.hash(), item);
    }
  }

  public byHash(hash: string) {
    const reference = this.items.get(hash);
    if (reference != null) {
      return reference;
    }

    const new_item = this.generate(hash);
    this.items.set(hash, this.generate(hash));
    return new_item;
  }

  public async load(): Promise<void> {
    await Promise.all(this.getItems().map(i => {
      return i.load();
    }))
  }

  public abstract gather(): Promise<void>;
  protected abstract generate(hash: string): I;
}