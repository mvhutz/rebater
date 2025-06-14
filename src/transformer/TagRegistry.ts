import * as LABEL from "../processes/Label";
import * as READ from "../processes/Read";
import * as TRANSFORMER from "../processes/Transformer";
import * as VAR from "../processes/Var";
import * as DEBUG from "../processes/Debug";
import { XML } from "./Lexer";

type TagParser = (attributes: Record<string, string>, children: ETL.Process[], parser: ETL.Transformer) => ETL.Process;

export class TagRegistry {
  private data: Map<string, TagParser>;

  constructor() {
    this.data = new Map();

    LABEL.registerTags(this);
    READ.registerTags(this);
    TRANSFORMER.registerTags(this);
    VAR.registerTags(this);
    DEBUG.registerTags(this);
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