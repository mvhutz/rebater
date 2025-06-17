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
import Literal from "../processes/Literal";
import Counter from "../processes/Counter";
import Coerce from "../processes/Coerce";
import Reference from "../processes/Reference";
import Row from "../processes/Row";
import Stack from "../processes/Stack";
import Write from "../processes/Write";
import DropRow from "../processes/DropRow";
import Match from "../processes/Match";

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
    Literal.registerActions(this);
    Counter.registerActions(this);
    Coerce.registerActions(this);
    Reference.registerActions(this);
    Row.registerActions(this);
    Stack.registerActions(this);
    Write.registerActions(this);
    DropRow.registerActions(this);
    Match.registerActions(this);
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