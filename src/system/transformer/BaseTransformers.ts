import z from "zod/v4";
import { AdvancedTransformer, AdvancedTransformerData } from "./AdvancedTransformer";
import { SimpleTransformer, SimpleTransformerData } from "./SimpleTransformer";
import assert from "assert";
import { readFile, glob } from "fs/promises";
import { Settings } from "../../shared/settings";
import { Runner } from "../runner/Runner";
import { TransformerResult } from "../../shared/worker/response";

/** ------------------------------------------------------------------------- */

export interface MalformedTransformerFileInfo {
  type: "malformed",
  path: string,
  error: string,
  text: string,
};

export interface AdvancedTransformerFileInfo {
  type: "advanced",
  path: string,
  data: AdvancedTransformerData,
};

export interface SimpleTransformerFileInfo {
  type: "simple",
  path: string,
  data: SimpleTransformerData,
};

export type TransformerFileInfo = AdvancedTransformerFileInfo | MalformedTransformerFileInfo | SimpleTransformerFileInfo;

/** ------------------------------------------------------------------------- */

export abstract class BaseTransformer {
  /**
   * Run the transformer.
   * @param runner The context to run in.
   * @returns Information as to how well the transformer ran.
   */
  abstract run(runner: Runner): TransformerResult;

  abstract toJSON(): BaseTransformerData;

  abstract getDetails(): { name: string, tags: string[] };

  /**
   * Parse a transformer from a file.
   * @param filepath The location of the file.
   * @param type The format the transformer is in.
   * @returns A new transformer.
   */
  public static async fromFile(filepath: string): Promise<TransformerFileInfo> {
    const raw = await readFile(filepath, 'utf-8');

    try {
      const json = JSON.parse(raw);
      return { type: "advanced", path: filepath, data: AdvancedTransformer.SCHEMA.parse(json).toJSON() };
    } catch (error) {
      let message;

      if (error instanceof z.ZodError) {
        message = `Invalid schema for ${filepath}: ${z.prettifyError(error)}`;
      } else if (error instanceof Error) {
        message = `Invalid schema for ${filepath}: ${error.message}`;
      } else {
        message = `Thrown: ${error}`;
      }

      return { type: "malformed", path: filepath, text: raw, error: message };
    }
  }

  public static async pullAllAvailable(settings: Settings): Promise<TransformerFileInfo[]> {
    const transformer_json_files = await Array.fromAsync(glob(settings.getTransformerPathGlob()));

    const transformers = new Array<TransformerFileInfo>();
    
    for (const transformer_file of transformer_json_files) {
      const transformer_reply = await BaseTransformer.fromFile(transformer_file);
      transformers.push(transformer_reply);
    }

    return transformers;
  }

  /**
   * Extract all transformers present in Rebater.
   * @param settings The settings to use to search.
   * @param filter Whether to return all transformers, or just those that will
   * be run.
   * @returns A list of transformers found.
   */
  public static async pullAll(settings: Settings, filter = false): Promise<BaseTransformerData[]> {
    const transformer_json_files = await Array.fromAsync(glob(settings.getTransformerPathGlob()));

    const transformers = new Array<BaseTransformerData>();
    
    for (const transformer_file of transformer_json_files) {
      const transformer_reply = await BaseTransformer.fromFile(transformer_file);
      if (transformer_reply.type === "malformed") continue;

      const { data: transformer_data } = transformer_reply;
      const transformer = TRANSFORMER_SCHEMA.parse(transformer_data);
      if (filter && !settings.willRun(transformer.getDetails())) continue;

      transformers.push(transformer_data);
    }

    return transformers;
  }

  /**
   * Find a valid order for a set of transformers to run in.
   * @description Certain transformers can require other to run before hand,
   * using the `<requires>` tag. This is useful when one transformer requires
   * another `<utility>` transformer to run beforehand.
   * @param transformers The transformers to sort.
   * @returns The same transformers, ordered in a way that causes no conflicts.
   */
  public static findValidOrder(transformers: AdvancedTransformer[]) {
    const by_name = new Map<string, AdvancedTransformer>();
    
    // No duplicates.
    for (const transformer of transformers) {
      assert.ok(!by_name.has(transformer.name), `Duplicate transformers named '${transformer.name}'!`);
      by_name.set(transformer.name, transformer);
    }

    // Is closed.
    for (const [, transformer] of by_name) {
      for (const requirement of transformer.requirements) {
        assert.ok(by_name.has(requirement), `Transformer '${transformer.name}' requires '${requirement}', which it cannot find!`);
      }
    }

    // Find topological ordering.
    const stack: AdvancedTransformer[] = [];
    const visited = new WeakSet<AdvancedTransformer>();

    function DFS(node: AdvancedTransformer) {
      visited.add(node);

      for (const neighbor_hash of node.requirements) {
        const neighbor = by_name.get(neighbor_hash);
        if (neighbor == null || visited.has(neighbor)) continue;
        DFS(neighbor);
      }

      stack.push(node);
    }

    for (const transformer of transformers) {
      if(visited.has(transformer)) continue;
      DFS(transformer);
    }

    return stack;
  }
}

/** ------------------------------------------------------------------------- */

export type BaseTransformerData = AdvancedTransformerData | SimpleTransformerData;

export const TRANSFORMER_SCHEMA: z.ZodType<BaseTransformer, BaseTransformerData> = z.union([
  AdvancedTransformer.SCHEMA,
  SimpleTransformer.SCHEMA
]);