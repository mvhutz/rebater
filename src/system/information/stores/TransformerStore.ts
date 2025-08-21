import path from "path";
import { AbstractStore } from "./AbstractStore";
import { getSubFiles } from "../../util";
import { TransformerFile } from "../items/TransformerFile";
import assert from "assert";
import { AdvancedTransformer } from "../../transformer/AdvancedTransformer";

/** ------------------------------------------------------------------------- */

interface Meta { directory: string };

/**
 * Holds all transformers.
 */
export class TransformerStore extends AbstractStore<TransformerFile, Meta> {
  public readonly name = "transformers";

  public async gather(): Promise<void> {
    for (const [filepath, name] of await getSubFiles(this.meta.directory)) {
      let type: "json" | "xml";
      if (path.parse(name).ext === ".json") {
        type = "json";
      } else if (path.parse(name).ext === ".xml") {
        type = "xml"
      } else {
        continue;
      }

      const reference = new TransformerFile(filepath, { type });
      this.add(reference);
    }
  }

  /**
   * Get all valid transformers.
   * @returns All transformers from files in the store, which are valid.
   */
  public getValid(): AdvancedTransformer[] {
    const transformer_replies = this.items.values().map(f => f.getData());
    const good = transformer_replies.filter(r => r.ok);
    return good.map(g => g.data).toArray();
  }

  /**
   * Find a valid order for a set of transformers to run in.
   * @description Certain transformers can require other to run before hand,
   * using the `<requires>` tag. This is useful when one transformer requires
   * another `<utility>` transformer to run beforehand.
   * @returns The same transformers, ordered in a way that causes no conflicts.
   */
  public static getOrdered(transformers: AdvancedTransformer[]): AdvancedTransformer[] {
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