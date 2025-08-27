import { Settings } from "../settings";
import { Counter } from "./Counter";
import { ExcelStore } from "./stores/ExcelStore";
import { RebateStore } from "./stores/RebateStore";
import { ReferenceStore } from "./stores/ReferenceStore";
import { SourceStore } from "./stores/SourceStore";
import { TransformerStore } from "./stores/TransformerStore";
import { Tracker } from "./Tracker";

/** ------------------------------------------------------------------------- */

export class State {
  public readonly counter: Counter;
  public readonly references: ReferenceStore;
  public readonly settings: Settings;
  public readonly sources: SourceStore;
  public readonly destinations: RebateStore;
  public readonly truths: RebateStore;
  public readonly outputs: ExcelStore;
  public readonly utilities: ReferenceStore;
  public readonly transformers: TransformerStore;
  public readonly tracker: Tracker;

  constructor(settings: Settings) {
    this.settings = settings;
    this.counter = new Counter();
    this.tracker = new Tracker();
    this.references = new ReferenceStore(settings.getReferencePath(), false, true);
    this.sources = new SourceStore(settings.getAllSourcePath(), true, true);
    this.destinations = new RebateStore(settings.getAllDestinationPath(), true, true);
    this.outputs = new ExcelStore(settings.getAllOutputPath(), true, true);
    this.truths = new RebateStore(settings.getAllTruthPath(), true, true);
    this.utilities = new ReferenceStore(settings.getAllUtilityPath(), true, true);
    this.transformers = new TransformerStore(settings.getAllTransformerPath(), false, true);
  }
}