import * as LABEL from "../processes/Label";
import * as READ from "../processes/Read";
import * as VAR from "../processes/Var";
import * as DEBUG from "../processes/Debug";

type Actor = (process: ETL.Process, state: ETL.Data[][]) => Promise<ETL.Data[]>;

export class ActionRegistry {
  private data: Map<string, Actor>;

  constructor() {
    this.data = new Map();

    LABEL.registerActions(this);
    READ.registerActions(this);
    VAR.registerActions(this);
    DEBUG.registerActions(this);
  }

  public add(name: string, parser: Actor) {
    if (this.data.has(name)) {
      throw Error(`Actor for '${name}' already exists.`);
    }

    this.data.set(name, parser);
  }

  public get(process: ETL.Process): Actor {
    const act = this.data.get(process.action.name);
    if (act == null) {
      throw Error(`Actor does not exist for action '${process.action.name}'`);
    }

    return act;
  }
}