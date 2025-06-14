import z from 'zod/v4';
import MAGIC from '../magic';
import Path from 'path';
import FS from 'fs/promises';
import { ActionRegistry } from '../transformer/ActionRegistry';
import { TagRegistry } from '../transformer/TagRegistry';

const PROCESS_NAME = "read";

/** ------------------------------------------------------------------------- */

const ReadActionSchema = z.object({
  name: z.literal(PROCESS_NAME),
  class: z.string(),
  subclass: z.string(),
});

type ReadAction = z.infer<typeof ReadActionSchema>;

async function runReadAction(process: ETL.Process, state: ETL.Data[][]): Promise<ETL.File[]> {
  if (state.length > 0) {
    throw Error("Read tag cannot intake data.");
  }

  const { class: _class, subclass } = ReadActionSchema.parse(process.action);
  
  const path = Path.join(
    MAGIC.DIRECTORY,
    _class,
    subclass, MAGIC.YEAR, `Q${MAGIC.QUARTER}`, '**/*');
  const results = new Array<ETL.File>();

  for await (const file of FS.glob(path)) {
    results.push({
      type: 'file',
      labels: new Set(),
      path: file,
    });
  }

  return results;
}

export function registerActions(registry: ActionRegistry) {
  registry.add(PROCESS_NAME, runReadAction);
}

/** ------------------------------------------------------------------------- */

const ReadTagAttributes = z.object({
  class: z.string(),
  subclass: z.string(),
});

function parseReadTag(attributes: Record<string, string>, children: ETL.Process[], transformer: ETL.Transformer): ETL.Process<ReadAction> {
  const { class: _class, subclass } = ReadTagAttributes.parse(attributes);

  const process = {
    id: Symbol(),
    dependents: new Set(children.map(c => c.id)),
    action: {
      name: PROCESS_NAME,
      class: _class,
      subclass: subclass,
    } satisfies ReadAction
  }

  transformer.set(process.id, process);
  return process;
}

/** ------------------------------------------------------------------------- */

export function registerTags(registry: TagRegistry) {
  registry.add(PROCESS_NAME, parseReadTag);
}
