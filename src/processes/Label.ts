import z from 'zod/v4';
import { ActionRegistry } from '../transformer/ActionRegistry';
import { TagRegistry } from '../transformer/TagRegistry';

const PROCESS_NAME = "label";

/** ------------------------------------------------------------------------- */

const LabelActionSchema = z.object({
  name: z.literal(PROCESS_NAME),
  add: z.array(z.string()),
  filter: z.array(z.string()),
});

type LabelAction = z.infer<typeof LabelActionSchema>;

async function runLabelAction(process: ETL.Process, state: ETL.Data[][]): Promise<ETL.Data[]> {
  const { filter, add } = LabelActionSchema.parse(process.action);
  return state
    // Flatten data.
    .flat(1)
    // Filter out only data with all labels in 'filter'.
    .filter(s => filter.every(label => s.labels.has(label)))
    // Add any new labels in 'add' to the label list.
    .map(s => ({ ...s, labels: new Set([...add, ...s.labels]) }));
}

export function registerActions(registry: ActionRegistry) {
  registry.add(PROCESS_NAME, runLabelAction);
}

/** ------------------------------------------------------------------------- */

const LabelTagAttributes = z.object({
  add: z.string().optional(),
  filter: z.string().optional(),
});

function parseLabelTag(attributes: Record<string, string>, children: ETL.Process[], transformer: ETL.Transformer): ETL.Process<LabelAction> {
  const { add, filter } = LabelTagAttributes.parse(attributes);

  const process = {
    id: Symbol(),
    dependents: new Set(children.map(c => c.id)),
    action: {
      name: PROCESS_NAME,
      add: add == null ? [] : [add],
      filter: filter == null ? [] : [filter],
    } satisfies LabelAction
  }

  transformer.set(process.id, process);
  return process;
}

/** ------------------------------------------------------------------------- */

export function registerTags(registry: TagRegistry) {
  registry.add(PROCESS_NAME, parseLabelTag);
}
