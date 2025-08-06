import assert from "assert";
import { AbstractItem } from "../items/AbstractItem";

/** ------------------------------------------------------------------------- */

export abstract class AbstractStore<Item extends AbstractItem<ItemData>, Meta, ItemData = ReturnType<Item["getData"]>> {
  protected items = new Map<string, Item>();
  public readonly meta: Meta;
  public abstract readonly name: string;

  public constructor(meta: Meta) {
    this.meta = meta;
  }

  public wipe(): void {
    this.items.clear();
  }

  public getItems(): Item[] {
    return this.items.values().toArray();
  }

  public async save(): Promise<void> {
    await Promise.all(this.getItems().map(async d => {
      await d.save();
    }))
  }

  public filter(fn: (item: Item) => boolean) {
    return this.getItems().filter(fn);
  }

  public add(item: Item) {
    const current = this.items.get(item.hash());
    assert.ok(current == null, `Item '${item.hash()}' already exists for '${this.name}'!`)

    this.items.set(item.hash(), item);
  }

  generate(hash: string): Item {
    throw Error(`Item '${hash}' does not exist for '${this.name}'!`);
  }

  public get(hash: string) {
    let current = this.items.get(hash);
    if (current == null) {
      current = this.generate(hash);
      this.add(current);
    }

    return current;
  }

  public async load(): Promise<void> {
    await Promise.all(this.getItems().map(i => {
      return i.load();
    }))
  }

  public abstract gather(): Promise<void>;
}