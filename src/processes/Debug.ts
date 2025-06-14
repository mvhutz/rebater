import z from 'zod/v4';
import { ActionRegistry } from '../transformer/ActionRegistry';
import { TagRegistry } from '../transformer/TagRegistry';

const PROCESS_NAME = "debug";

/** ------------------------------------------------------------------------- */

const DebugActionSchema = z.object({
  name: z.literal(PROCESS_NAME),
});

type DebugAction = z.infer<typeof DebugActionSchema>;

async function runDebugAction(process: ETL.Process, state: ETL.Data[][]): Promise<ETL.Data[]> {
  void DebugActionSchema.parse(process.action);
  const result = state.flat(1);

  console.log(result);
  return result;
}

export function registerActions(registry: ActionRegistry) {
  registry.add(PROCESS_NAME, runDebugAction);
}

/** ------------------------------------------------------------------------- */

function parseDebugTag(_: Record<string, string>, children: ETL.Process[], transformer: ETL.Transformer): ETL.Process<DebugAction> {
  const process = {
    id: Symbol(),
    dependents: new Set(children.map(c => c.id)),
    action: {
      name: PROCESS_NAME,
    } satisfies DebugAction
  }

  transformer.set(process.id, process);
  return process;
}

/** ------------------------------------------------------------------------- */

export function registerTags(registry: TagRegistry) {
  registry.add(PROCESS_NAME, parseDebugTag);
}
