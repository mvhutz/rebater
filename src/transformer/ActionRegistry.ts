import { ETL } from "../../types";
import Debug from "../processes/Debug";
import Excel from "../processes/Excel";
import Label from "../processes/Label";
import Read from "../processes/Read";
import Sheet from "../processes/Sheet";
import Transform from "../processes/Transform";
import * as VAR from "../processes/Var";

type Actor = (process: ETL.Process, state: ETL.Data[][]) => Promise<ETL.Data[]>;

export class ActionRegistry {
  private data: Map<string, Actor>;

  constructor() {
    this.data = new Map();

    Label.registerActions(this);
    Read.registerActions(this);
    VAR.registerActions(this);
    Debug.registerActions(this);
    Excel.registerActions(this);
    Transform.registerActions(this);
    Sheet.registerActions(this);
  }

  public add(name: string, parser: Actor) {
    if (this.data.has(name)) {
      throw Error(`Actor for '${name}' already exists.`);
    }

    this.data.set(name, parser);
  }

  public get(process: ETL.Process): Actor {
    const act = this.data.get(process.action.type);
    if (act == null) {
      throw Error(`Actor does not exist for action '${process.action.type}'`);
    }

    return act;
  }
}