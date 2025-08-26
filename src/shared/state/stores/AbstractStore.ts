import assert from "assert";
import { AbstractItem } from "../items/AbstractItem";

/** ------------------------------------------------------------------------- */

/**
 * Stores AbstractItems.
 */
export abstract class AbstractStore<Item extends AbstractItem<ItemData>, ItemData = ReturnType<Item["getData"]>> {
  protected items = new Map<string, Item>();

  /** The name of the store. */
  public abstract readonly name: string;

  /**
   * Clear all items in the store.
   */
  public wipe(): void {
    this.items.clear();
  }

  /**
   * Size of store.
   * @returns Number of items is store.
   */
  public size(): number {
    return this.items.size;
  }

  /**
   * Return all items currently in the store.
   * @returns A list of all items in the store.
   */
  public getItems(): Item[] {
    return this.items.values().toArray();
  }

  /**
   * Save all items in the store, to permanent storage.
   */
  public async save(): Promise<void> {
    await Promise.all(this.getItems().map(async d => {
      await d.save();
    }))
  }

  /**
   * Based on certain criteria, filter out certain items.
   * @param fn The criteria.
   * @returns A list of items which satisfy the criteria.
   */
  public filter(fn: (item: Item) => boolean) {
    return this.getItems().filter(fn);
  }

  /**
   * Add an item to the store.
   * @param item The item to add.
   */
  public add(item: Item) {
    const current = this.items.get(item.hash());
    assert.ok(current == null, `Item '${item.hash()}' already exists for '${this.name}'!`)

    this.items.set(item.hash(), item);
  }

  /**
   * If the user gets an item in the store which does not exist, create a new
   * item for them on the fly.
   * @throws By default, a store is not capable of generating a new value.
   * @param hash The hash of the item which should be generated.
   */
  generate(hash: string): Item {
    throw Error(`Item '${hash}' does not exist for '${this.name}'!`);
  }

  /**
   * Get an item in the store by its hash.
   * @param hash The hash to query by.
   * @returns The first item which matches the hash.
   */
  public get(hash: string) {
    let current = this.items.get(hash);
    if (current == null) {
      current = this.generate(hash);
      this.add(current);
    }

    return current;
  }

  /**
   * Load all data from gathered items in permanent storage.
   */
  public async load(): Promise<void> {
    await Promise.all(this.getItems().map(i => {
      return i.load();
    }))
  }

  /**
   * Search for items in permanent storage and generate them, without loading
   * their data.
   */
  public abstract gather(): Promise<void>;
}