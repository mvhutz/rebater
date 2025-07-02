import { contextBridge, ipcRenderer } from "electron";
import IPC from "./shared/ipc";

/** ------------------------------------------------------------------------- */

const { key, api } = IPC.exposeApiToGlobalWindow({ exposeAll: true });

declare global {
  interface Window {
    [key]: typeof api
  }
}