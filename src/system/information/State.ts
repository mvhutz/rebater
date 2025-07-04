import { BasicCounter, Counter } from "./Counter";
import { BasicReference, Reference } from "./Reference";
import { Handlers } from "./Handlers";
import type Settings from "../../shared/settings";

/** ------------------------------------------------------------------------- */

export abstract class State {
  public abstract setTime(time: Time): void;
  public abstract getTime(): Time;

  public abstract getCounter(name: string): Counter;
  public abstract getReference(name: string): Promise<Reference>;
  public abstract getSettings(): Settings;
  public abstract get handlers(): Handlers;
}

export class BasicState extends State {
  public static readonly INITIAL_COUNTER_VALUE = 0;

  private time: Time;

  private counters: Map<string, BasicCounter>;
  private references: Map<string, BasicReference>;

  private settings: Settings;
  public handlers: Handlers;

  constructor(time: Time, settings: Settings, handlers: Handlers = {}) {
    super();

    this.time = time;
    this.settings = settings;
    this.handlers = handlers;
    this.counters = new Map();
    this.references = new Map();
  }

  public getSettings(): Settings {
    return this.settings;
  }

  public setTime(time: Time): void {
    this.time = time;
  }

  public getTime(): Time {
    return this.time;
  }

  public getCounter(name: string): BasicCounter {
    const counter = this.counters.get(name);
    if (counter != null) return counter;

    const new_counter = new BasicCounter(BasicState.INITIAL_COUNTER_VALUE);
    this.counters.set(name, new_counter);
    return new_counter;
  }

  public async getReference(name: string): Promise<BasicReference> {
    const counter = this.references.get(name);
    if (counter != null) return counter;

    const path = this.getSettings().getReferencePath(name);
    const new_reference = await BasicReference.load(path);
    this.references.set(name, new_reference);
    return new_reference;
  }
}
