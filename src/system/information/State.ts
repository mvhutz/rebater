import mutexify from 'mutexify/promise';
import { ReferenceStore } from "./reference/ReferenceStore";
import { Settings } from "../../shared/settings";
import { SourceStore } from "./source/SourceStore";
import { CounterStore } from "./counter/CounterStore";
import { DestinationStore } from './destination/DestinationStore';

/** ------------------------------------------------------------------------- */

export class State {
  public readonly counters: CounterStore;
  public readonly references: ReferenceStore;
  public readonly settings: Settings;
  public readonly sources: SourceStore;
  public readonly destinations: DestinationStore;

  public ask: (question: string) => Promise<Maybe<string>>;
  private lock = mutexify();

  constructor(settings: Settings, onAsk: (question: string) => Promise<Maybe<string>>) {
    this.settings = settings;
    this.counters = new CounterStore();
    this.references = new ReferenceStore(settings.getReferencePath());
    this.sources = new SourceStore(settings.getAllSourcePath());
    this.destinations = new DestinationStore(settings.getAllDestinationPath());
    this.ask = onAsk;
  }

  public async requestAsk(): Promise<() => void> {
    return await this.lock();
  }
}
