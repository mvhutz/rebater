import { TagRegistry } from '../transformer/TagRegistry';

const PROCESS_NAME = "transformer";

/** ------------------------------------------------------------------------- */

export function registerTags(registry: TagRegistry) {
  registry.add(PROCESS_NAME, () => ({
    id: Symbol(),
    dependents: new Set(),
    action: {
      name: PROCESS_NAME,
    }
  }));
}
