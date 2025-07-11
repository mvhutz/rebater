export enum ResourceStatus {
  PRESENT,
  LOADING,
  SAVING
};

export interface Resource<T> {
  status: ResourceStatus;
  data: T;
  changed: boolean;
}

export function resource<T>(data: T, status = ResourceStatus.PRESENT, changed = false): Resource<T> {
  return { data, status, changed };
}