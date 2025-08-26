import { bad, good, Reply } from "../reply";
import { Settings } from "../settings";
import { Counter } from "./Counter";
import { DestinationStore } from "./stores/DestinationStore";
import { OutputStore } from "./stores/OutputStore";
import { ReferenceStore } from "./stores/ReferenceStore";
import { SourceStore } from "./stores/SourceStore";
import { TransformerStore } from "./stores/TransformerStore";
import { TruthStore } from "./stores/TruthStore";
import { UtilityStore } from "./stores/UtilityStore";
import { Tracker } from "./Tracker";

/** ------------------------------------------------------------------------- */

export class State {
  public readonly counter: Counter;
  public readonly references: ReferenceStore;
  public readonly settings: Settings;
  public readonly sources: SourceStore;
  public readonly destinations: DestinationStore;
  public readonly truths: TruthStore;
  public readonly outputs: OutputStore;
  public readonly utilities: UtilityStore;
  public readonly transformers: TransformerStore;
  public readonly tracker: Tracker;

  constructor(settings: Settings) {
    this.settings = settings;
    this.counter = new Counter();
    this.tracker = new Tracker();
    this.references = new ReferenceStore(settings.getReferencePath());
    this.sources = new SourceStore(settings.getAllSourcePath());
    this.destinations = new DestinationStore(settings.getAllDestinationPath());
    this.outputs = new OutputStore(settings.getAllOutputPath());
    this.truths = new TruthStore(settings.getAllTruthPath());
    this.utilities = new UtilityStore(settings.getAllUtilityPath());
    this.transformers = new TransformerStore(settings.getAllTransformerPath());
  }

  /**
   * Load all stores.
   */
  public async load(): Promise<Reply> {
    try {
      this.sources.wipe();
      this.references.wipe();
      this.truths.wipe();
      this.destinations.wipe();
      this.outputs.wipe();
      this.utilities.wipe();

      await this.sources.gather();
      await this.sources.load();
      await this.references.gather();
      await this.references.load();
      await this.truths.gather();
      await this.truths.load();
      await this.transformers.gather();
      await this.transformers.load();
      return good(undefined);
    } catch (err) {
      return bad(`${err}`);
    }
  }

  /**
   * Save all stores.
   */
  public async save() {
    await this.destinations.save();
    await this.references.save();
    await this.outputs.save();
    await this.utilities.save();
  }
}