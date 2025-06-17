import assert from "node:assert";
import { ActionRegistry } from "./ActionRegistry";
import { ETL } from "../../types";

interface CompleteStatus {
  id: symbol;
  data: ETL.Data[];
  complete: true;
}

interface IncompleteStatus {
  id: symbol;
  complete: false;
}

type Status = IncompleteStatus | CompleteStatus;
type State = Map<symbol, Status>;

export class Runner {
  public registry: ActionRegistry;

  constructor(registry: ActionRegistry) {
    this.registry = registry;
  }

  private isReady(process: ETL.Process, state: State) {
    const status = state.get(process.id);
    assert.ok(status != null);

    if (status.complete) return false;

    for (const dependency of process.dependencies) {
      const their_status = state.get(dependency);
      assert.ok(their_status != null);

      if (!their_status.complete) return false;
    }


    return true;
  }

  private async stepOne(process: ETL.Process, state: State) {
    if (!this.isReady(process, state)) return false;

    const input = new Array<ETL.Data[]>();

    for (const dependency of process.dependencies) {
      const their_status = state.get(dependency)!;
      assert.ok(their_status.complete);

      input.push(their_status.data);
    }

    const actor = this.registry.get(process);
    // console.log(`Running ${process.action.type}`)
    const output = await actor(process, input);

    state.set(process.id, {
      id: process.id,
      complete: true,
      data: output,
    });

    return true;
  }

  private async stepAll(state: State, transformer: ETL.Transformer) {
    let changed = false;

    for (const [, process] of transformer) {
      const updated = await this.stepOne(process, state);
      changed ||= updated;
    }

    return changed;
  }

  public async run(transformer: ETL.Transformer) {
    const state: State = new Map();

    for (const [id, ] of transformer) {
      state.set(id, { id, complete: false })
    }

    let changed: boolean;
    let i = 0;
    do {
      // console.log(`Iteration ${i}`);
      i++;
      changed = await this.stepAll(state, transformer);
    } while (changed && i < 100);
  }
}
