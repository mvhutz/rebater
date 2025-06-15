import z from 'zod/v4';
import { ActionRegistry } from '../transformer/ActionRegistry';
import { TagRegistry } from '../transformer/TagRegistry';
import { ETL } from '../../types';

export function makeBasicRegistration<A extends object, Input extends ETL.Data, Output extends ETL.Data>(options: {
  name: string,
  schema?: z.ZodType<A>,
  types?: Input["type"][],
  act: (action: A & ETL.Action, data: Input[][]) => Promise<Output[]>
}) {
  const { schema = z.object({}) as z.ZodType<A> } = options;

  const BaseActionSchema = z.intersection(schema, z.object({
    type: z.literal(options.name),
  }));

  type BaseAction = z.infer<typeof BaseActionSchema>;

  async function runBaseAction(process: ETL.Process, matrix: ETL.Data[][]): Promise<ETL.Data[]> {
    const action = BaseActionSchema.parse(process.action);

    const input = matrix.map(row => row.map(datum => {
      if (options.types && !options.types.includes(datum.type)) {
        throw Error(`Invalid type for '${options.name}': '${datum.type}'`);
      }

      return datum as Input;
    }));

    return await options.act(action, input);
  }

  function parseBaseTag(_attributes: Record<string, string>, children: ETL.Process[], transformer: ETL.Transformer): ETL.Process<BaseAction> {
    const attributes = schema.parse(_attributes);
    
    const process = {
      id: Symbol(),
      dependents: new Set(children.map(c => c.id)),
      action: { ...attributes, type: options.name } satisfies BaseAction
    }

    transformer.set(process.id, process);
    return process;
  }

  return {
    registerTags(registry: TagRegistry) {
      registry.add(options.name, parseBaseTag);
    },
    registerActions(registry: ActionRegistry) {
      registry.add(options.name, runBaseAction);
    }
  }
}