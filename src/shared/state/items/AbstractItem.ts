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