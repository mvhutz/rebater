import assert from "assert";
import { ETL } from "../../types";
import Debug from "../processes/Debug";
import Excel from "../processes/Excel";
import Label from "../processes/Label";
import Read from "../processes/Read";
import Sheet from "../processes/Sheet";
import Transform from "../processes/Transform";
import Trim from "../processes/Trim";
import * as Var from "../processes/Var";
import Slice from "../processes/Slice";
import Transpose from "../processes/Transpose";
import Column from "../processes/Column";

type Actor = (process: ETL.Process, state: ETL.Data[][]) => Promise<ETL.Data[]>;

export class ActionRegistry {
  private data: Map<string, Actor>;

  constructor() {
    this.data = new Map();

    Label.registerActions(this);
    Read.registerActions(this);
    Var.registerActions(this);
    Debug.registerActions(this);
    Excel.registerActions(this);
    Transform.registerActions(this);
    Sheet.registerActions(this);
    Trim.registerActions(this);
    Slice.registerActions(this);
    Transpose.registerActions(this);
    Column.registerActions(this);
  }

  public add(name: string, parser: Actor) {
    assert.ok(!this.data.has(name), `Actor for '${name}' already exists.`);
    this.data.set(name, parser);
  }

  public get(process: ETL.Process): Actor {
    const act = this.data.get(process.action.type);
    assert.ok(act != null, `Actor does not exist for action '${process.action.type}'`);

    return act;
  }
}