import IPC from "./system/ipc";

/** ------------------------------------------------------------------------- */

const { key, api } = IPC.exposeApiToGlobalWindow({ exposeAll: true });

declare global {
  interface Window {
    [key]: typeof api
  }
}