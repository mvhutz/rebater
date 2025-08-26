/**
 * An item to store in any `AbstractStore`.
 */
export abstract class AbstractItem<Data> {
  // The data the item contains.
  protected data: Data;
  
  protected constructor(initial: Data) {
    this.data = initial;
  }

  /**
   * A unique identifier for the item.
   */
  abstract hash(): string;

  /**
   * Save the file to some permanent storage.
   */
  abstract save(): Promise<void>;

  /**
   * Add some datum to the current data within this item.
   * @param datum 
   */
  abstract insert(datum: Data): void;

  /**
   * Push multiple set of data into the item.
   * @param data The set of data to push.
   */
  public push(...data: Data[]) {
    for (const datum of data) {
      this.insert(datum);
    }
  }

  /**
   * Add the data of other abstract items into this item.
   * @param others The other items.
   */
  public add(...others: AbstractItem<Data>[]) {
    for (const other of others) {
      this.push(other.data);
    }
  }

  /**
   * Load the item's data from permanent storage.
   */
  protected abstract fetch(): Promise<Data>;

  /**
   * Load the item's data from permanent storage.
   */
  public async load(): Promise<void> {
    this.data = await this.fetch();
  }

  /**
   * Get the data this item contains.
   */
  public getData(): Data {
    return this.data;
  }
}