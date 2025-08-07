export enum ResourceStatus {
  PRESENT,
  LOADING,
  SAVING
};

/** The state of a certain resource, which must be fetched from the main thread. */
export interface Resource<T> {
  status: ResourceStatus;
  data: T;
  changed: boolean;
}

/**
 * Build a resource object.
 * @param data The data to give.
 * @param status The current status.
 * @param changed Whether the resource has changed on the client side.
 * @returns A complete `Resource` object.
 */
export function resource<T>(data: T, status = ResourceStatus.PRESENT, changed = false): Resource<T> {
  return { data, status, changed };
}