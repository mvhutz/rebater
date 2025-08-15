import { bad, good, Reply } from "../shared/reply";
import { Settings } from "../shared/settings";
import { Counter } from "./information/Counter";
import { DestinationStore } from "./information/stores/DestinationStore";
import { OutputStore } from "./information/stores/OutputStore";
import { ReferenceStore } from "./information/stores/ReferenceStore";
import { SourceStore } from "./information/stores/SourceStore";
import { TransformerStore } from "./information/stores/TransformerStore";
import { TruthStore } from "./information/stores/TruthStore";
import { UtilityStore } from "./information/stores/UtilityStore";

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
  
  public constructor(settings: Settings) {
    this.settings = settings;
    this.counter = new Counter();
    this.references = new ReferenceStore({ directory: settings.getReferencePath() });
    this.sources = new SourceStore({ directory: settings.getAllSourcePath() });
    this.destinations = new DestinationStore({ directory: settings.getAllDestinationPath() });
    this.outputs = new OutputStore({ directory: settings.getAllOutputPath() });
    this.truths = new TruthStore({ directory: settings.getAllTruthPath() });
    this.utilities = new UtilityStore({ directory: settings.getAllUtilityPath() });
    this.transformers = new TransformerStore({ directory: settings.getAllTransformerPath() })
  }

  /**
   * Load all stores.
   */
  public async load(): Promise<Reply> {
    try {
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