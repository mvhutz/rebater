import { XML } from "./Lexer";
import { TagRegistry } from "./TagRegistry";

export class Parser {
  public registry: TagRegistry;

  constructor(registry: TagRegistry) {
    this.registry = registry;
  }

  private _parse(xml: XML, transformer: ETL.Transformer): ETL.Process {
    const parser = this.registry.get(xml);
    const children = xml.elements.map(e => this._parse(e, transformer));

    return parser(xml.attributes ?? {}, children, transformer);
  }

  public parse(xml: XML): ETL.Transformer {
    const transformer = new Map();
    void this._parse(xml, transformer);
    return transformer;
  }
}