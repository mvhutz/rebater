import Label from "../processes/Label";
import Read from "../processes/Read";
import Transform from "../processes/Transform";
import * as Var from "../processes/Var";
import Debug from "../processes/Debug";
import Excel from "../processes/Excel";
import { XML } from "./Lexer";
import Sheet from "../processes/Sheet";
import type { ETL } from '../../types';
import Trim from "../processes/Trim";
import assert from "assert";
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

type TagParser = (attributes: Record<string, string>, children: ETL.Process[], parser: ETL.Transformer) => ETL.Process;

export class TagRegistry {
  private data: Map<string, TagParser>;

  constructor() {
    this.data = new Map();

    Label.registerTags(this);
    Read.registerTags(this);
    Transform.registerTags(this);
    Var.registerTags(this);
    Debug.registerTags(this);
    Excel.registerTags(this);
    Sheet.registerTags(this);
    Trim.registerTags(this);
    Slice.registerTags(this);
    Transpose.registerTags(this);
    Column.registerTags(this);
    Literal.registerTags(this);
    Counter.registerTags(this);
    Coerce.registerTags(this);
    Reference.registerTags(this);
    Row.registerTags(this);
    Stack.registerTags(this);
    Write.registerTags(this);
  }

  public add(name: string, parser: TagParser) {
    assert.ok(!this.data.has(name), `Parser for '${name}' already exists.`);
    this.data.set(name, parser);
  }

  public get(tag: XML): TagParser {
    const parser = this.data.get(tag.name);
    assert.ok(parser != null, `Parser does not exist for tag '${tag.name}'`);

    return parser;
  }
}