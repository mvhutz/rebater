import z from 'zod/v4';
import { ActionRegistry } from '../transformer/ActionRegistry';
import { TagRegistry } from '../transformer/TagRegistry';

/** ------------------------------------------------------------------------- */

function getVariable(name: string, transformer: ETL.Transformer): ETL.Process {
  const processID = Symbol.for(name);
  let result = transformer.get(processID);
  if (result == null) {
    result = {
      id: processID,
      name: name,
      dependents: new Set(),
      action: { name: "pass" }
    };

    transformer.set(processID, result);
  }
  
  return result;
}

/** ------------------------------------------------------------------------- */

const PassActionSchema = z.object({
  name: z.literal("pass"),
});

async function runPassAction(process: ETL.Process, state: ETL.Data[][]): Promise<ETL.Data[]> {
  void PassActionSchema.parse(process.action);
  return state.flat(1);
}

export function registerActions(registry: ActionRegistry) {
  registry.add("pass", runPassAction);
}

/** ------------------------------------------------------------------------- */

const FromTagAttributes = z.object({
  var: z.string(),
});

function parseFromTag(attributes: Record<string, string>, children: ETL.Process[], transformer: ETL.Transformer): ETL.Process {
  if (children.length > 0) {
    throw Error("From tag should not have children.");
  }

  const { var: _var } = FromTagAttributes.parse(attributes);
  return getVariable(_var, transformer);
}

/** ------------------------------------------------------------------------- */

const ToTagAttributes = z.object({
  var: z.string()
});

function parseToTag(attributes: Record<string, string>, children: ETL.Process[], transformer: ETL.Transformer): ETL.Process {
  const { var: _var } = ToTagAttributes.parse(attributes);

  const variable = getVariable(_var, transformer);
  children.forEach(c => variable.dependents.add(c.id));

  return variable;
}

/** ------------------------------------------------------------------------- */

export function registerTags(registry: TagRegistry) {
  registry.add("from", parseFromTag);
  registry.add("to", parseToTag);
}
