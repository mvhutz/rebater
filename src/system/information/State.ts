import { ReferenceStore } from "./reference/ReferenceStore";
import { Settings } from "../../shared/settings";
import { SourceStore } from "./source/SourceStore";
import { CounterStore } from "./counter/CounterStore";
import { DestinationStore } from './destination/DestinationStore';
import { Asker } from "../runner/Asker";

/** ------------------------------------------------------------------------- */

export class State {
  public readonly counters: CounterStore;
  public readonly references: ReferenceStore;
  public readonly settings: Settings;
  public readonly sources: SourceStore;
  public readonly destinations: DestinationStore;
  public readonly asker = new Asker();

  constructor(settings: Settings) {
    this.settings = settings;
    this.counters = new CounterStore();
    this.references = new ReferenceStore(settings.getReferencePath());
    this.sources = new SourceStore(settings.getAllSourcePath());
    this.destinations = new DestinationStore(settings.getAllDestinationPath());
  }
}
