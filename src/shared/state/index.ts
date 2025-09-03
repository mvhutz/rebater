import path from "path";
import { Counter } from "./Counter";
import { ExcelStore } from "./stores/ExcelStore";
import { RebateStore } from "./stores/RebateStore";
import { ReferenceStore } from "./stores/ReferenceStore";
import { SourceStore } from "./stores/SourceStore";
import { TransformerStore } from "./stores/TransformerStore";
import { TrackerPointer } from "./pointer/TrackerPointer";
import { MatrixStore } from "./stores/MatrixStore";

/** ------------------------------------------------------------------------- */

export class State {
  public readonly directory: string;
  public readonly counter: Counter;
  public readonly references: ReferenceStore;
  public readonly sources: SourceStore;
  public readonly destinations: RebateStore;
  public readonly truths: RebateStore;
  public readonly outputs: ExcelStore;
  public readonly utilities: ReferenceStore;
  public readonly transformers: TransformerStore;
  public readonly tracker: TrackerPointer;
  public readonly debug: MatrixStore;

  constructor(directory: string) {
    this.directory = directory;
    this.counter = new Counter();
    this.tracker = new TrackerPointer(path.join(directory, "tracker.json"), true);
    this.references = new ReferenceStore(path.join(directory, "tables"), false);
    this.sources = new SourceStore(path.join(directory, "sources"), true, true);
    this.destinations = new RebateStore(path.join(directory, "rebates"), true);
    this.outputs = new ExcelStore(path.join(directory, "upload"), true);
    this.truths = new RebateStore(path.join(directory, "truth"), true);
    this.utilities = new ReferenceStore(path.join(directory, "utility"), true);
    this.transformers = new TransformerStore(path.join(directory, "transformers"), false);
    this.debug = new MatrixStore(path.join(directory, "debug"), true);
  }

  async refresh() {
    await this.tracker.unwatch();
    await this.references.unwatch();
    await this.sources.unwatch();
    await this.destinations.unwatch();
    await this.outputs.unwatch();
    await this.truths.unwatch();
    await this.utilities.unwatch();
    await this.transformers.unwatch();
    await this.debug.unwatch();

    this.tracker.watch();
    this.references.watch();
    this.sources.watch();
    this.destinations.watch();
    this.outputs.watch();
    this.truths.watch();
    this.utilities.watch();
    this.transformers.watch();
    this.debug.watch();
  }
}