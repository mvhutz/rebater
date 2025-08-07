import IPC from "./shared/ipc";

/** ------------------------------------------------------------------------- */

// Instantiate IPC.
const API = IPC.exposeApiToGlobalWindow({ exposeAll: true });

declare global {
  interface Window {
    [API.key]: typeof API.api
  }
}