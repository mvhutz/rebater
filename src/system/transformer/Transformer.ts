import { Runner } from "../runner/Runner";
import { TransformerResult } from "../../shared/worker/response";
import { AdvancedTransformerData } from "../../shared/transformer/advanced";
import { SimpleTransformerData } from "../../shared/transformer/simple";
import assert from "node:assert";

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

export abstract class Transformer {
  public abstract name: string;

  /**
   * Run the transformer.
   * @param runner The context to run in.
   * @returns Information as to how well the transformer ran.
   */
  public abstract run(runner: Runner): TransformerResult;

  public abstract getDetails(): { name: string, tags: string[] };

  public abstract getDeps(): string[];

  /**
   * Find a valid order for a set of transformers to run in.
   * @description Certain transformers can require other to run before hand,
   * using the `<requires>` tag. This is useful when one transformer requires
   * another `<utility>` transformer to run beforehand.
   * @param transformers The transformers to sort.
   * @returns The same transformers, ordered in a way that causes no conflicts.
   */
  public static findValidOrder(transformers: Transformer[]) {
    const by_name = new Map<string, Transformer>();
    
    // No duplicates.
    for (const transformer of transformers) {
      assert.ok(!by_name.has(transformer.name), `Duplicate transformers named '${transformer.name}'!`);
      by_name.set(transformer.name, transformer);
    }

    // Is closed.
    for (const [, transformer] of by_name) {
      for (const requirement of transformer.getDeps()) {
        assert.ok(by_name.has(requirement), `Transformer '${transformer.name}' requires '${requirement}', which it cannot find!`);
      }
    }

    // Find topological ordering.
    const stack: Transformer[] = [];
    const visited = new WeakSet<Transformer>();

    function DFS(node: Transformer) {
      visited.add(node);

      for (const neighbor_hash of node.getDeps()) {
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
