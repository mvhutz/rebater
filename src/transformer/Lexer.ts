import z from "zod/v4";
import Path from 'path';
import MAGIC from "../magic";
import * as FS from 'fs/promises';
import XMLConvert from 'xml-js';

export const XMLSchema = z.object({
  name: z.string(),
  attributes: z.record(z.string(), z.string()).optional(),
  get elements() { return z.array(XMLSchema); }
});

export type XML = z.infer<typeof XMLSchema>;

const ConfigSchema = z.object({
  elements: z.array(XMLSchema)
});

export class Lexer {
  static async fromConfig(name: string): Promise<XML> {
    const totalPath = Path.join(MAGIC.DIRECTORY, 'transformers', `${name}.xml`);
    const xml = await FS.readFile(totalPath, 'utf-8');
  
    const data = XMLConvert.xml2js(xml, {
      compact: false,
      ignoreComment: true,
      alwaysChildren: true,
      addParent: false,
    });
    
    const { elements: [transformer] } = await ConfigSchema.parseAsync(data);
    return transformer;
  }
}
