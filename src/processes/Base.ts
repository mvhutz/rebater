import z from 'zod/v4';
import { ActionRegistry } from '../transformer/ActionRegistry';
import { TagRegistry } from '../transformer/TagRegistry';
import { ETL } from '../../types';
import assert from 'assert';

export function getVariable(name: string, transformer: ETL.Transformer): ETL.Process {
  const processID = Symbol.for(name);
  let result = transformer.get(processID);
  if (result == null) {
    result = {
      id: processID,
      name: name,
      dependencies: new Set(),
      action: { type: "pass" }
    };

    transformer.set(processID, result);
  }
  
  return result;
}

export function makeBasicRegistration<A extends object, Input extends ETL.Data, Output extends ETL.Data>(options: {
  name: string,
  schema?: z.ZodType<A>,
  types?: Input["type"][],
  act: (action: A & ETL.Action, data: Input[][]) => Promise<Output[]>,
  postParse?: (attributes: A, process: ETL.Process, transformer: ETL.Transformer) => ETL.Process,
}) {
  const { schema = z.object({}) as z.ZodType<A> } = options;

  const BaseActionSchema = z.intersection(schema, z.object({
    type: z.literal(options.name),
  }));

  const BaseAttributesSchema = z.intersection(schema, z.object({
    fromVar: z.string().optional(),
    toVar: z.string().optional(),
    labelAdd: z.string().optional(),
    labelFilter: z.string().optional(),
  }));

  type BaseAttributes = z.infer<typeof BaseAttributesSchema>;

  async function runBaseAction(process: ETL.Process, matrix: ETL.Data[][]): Promise<ETL.Data[]> {
    const action = BaseActionSchema.parse(process.action);

    const input = matrix.map(row => row.map(datum => {
      assert.ok(options.types == null || options.types.includes(datum.type),
        `Invalid type for '${options.name}': '${datum.type}'`);

      return datum as Input;
    }));

    return await options.act(action, input);
  }

  function fromVarPreProcessing(attributes: BaseAttributes, children: ETL.Process[], transformer: ETL.Transformer) {
    const { fromVar } = attributes;
    if (fromVar == null) return children;

    return [getVariable(fromVar, transformer), ...children];
  }

  function filterLabelPreProcessing(attributes: BaseAttributes, children: ETL.Process[], transformer: ETL.Transformer) {
    const { labelFilter } = attributes;
    if (labelFilter == null) return children;

    return children.map(child => {
      const filter: ETL.Process = {
        id: Symbol(),
        dependencies: new Set([child.id]),
        action: {
          type: 'label',
          filter: labelFilter
        }
      };

      transformer.set(filter.id, filter);
      return filter;
    });
  }

  function toVarPostProcessing(attributes: BaseAttributes, process: ETL.Process, transformer: ETL.Transformer) {
    const { toVar } = attributes;
    if (toVar == null) return process;

    const variable = getVariable(toVar, transformer);
    variable.dependencies.add(process.id);
    return variable;
  }

  function addLabelPostProcessing(attributes: BaseAttributes, process: ETL.Process, transformer: ETL.Transformer) {
    const { labelAdd } = attributes;
    if (labelAdd == null) return process;

    const labeler: ETL.Process = {
      id: Symbol(),
      dependencies: new Set([process.id]),
      action: {
        type: 'label',
        add: labelAdd,
      }
    };

    transformer.set(labeler.id, labeler);
    return labeler;
  }

  function parseBaseTag(_attributes: Record<string, string>, children: ETL.Process[], transformer: ETL.Transformer): ETL.Process {
    const attributes = BaseAttributesSchema.parse(_attributes);

    children = fromVarPreProcessing(attributes, children, transformer);
    children = filterLabelPreProcessing(attributes, children, transformer);
    
    let process: ETL.Process = {
      id: Symbol(),
      dependencies: new Set(children.map(c => c.id)),
      action: { ...attributes, type: options.name }
    };

    transformer.set(process.id, process);

    process = options?.postParse?.(attributes, process, transformer) ?? process;

    process = addLabelPostProcessing(attributes, process, transformer);
    process = toVarPostProcessing(attributes, process, transformer);
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