import Label from "../processes/Label";
import Read from "../processes/Read";
import Transform from "../processes/Transform";
import * as VAR from "../processes/Var";
import Debug from "../processes/Debug";
import Excel from "../processes/Excel";
import { XML } from "./Lexer";

type TagParser = (attributes: Record<string, string>, children: ETL.Process[], parser: ETL.Transformer) => ETL.Process;

export class TagRegistry {
  private data: Map<string, TagParser>;

  constructor() {
    this.data = new Map();

    Label.registerTags(this);
    Read.registerTags(this);
    Transform.registerTags(this);
    VAR.registerTags(this);
    Debug.registerTags(this);
    Excel.registerTags(this);
  }

  public add(name: string, parser: TagParser) {
    if (this.data.has(name)) {
      throw Error(`Parser for '${name}' already exists.`);
    }

    this.data.set(name, parser);
  }

  public get(tag: XML): TagParser {
    const parser = this.data.get(tag.name);
    if (parser == null) {
      throw Error(`Parser does not exist for tag '${tag.name}'`);
    }

    return parser;
  }
}