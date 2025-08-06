import path from "path";
import { Worker } from 'worker_threads';
import { bad, good } from "../reply";
import { SettingsData } from "../settings";
import { Answer, WorkerRequest } from "../worker/request";
import { WorkerResponseSchema } from "../worker/response";
import { BrowserWindow } from "electron";
import IPC from ".";
import z from "zod/v4";

/** ------------------------------------------------------------------------- */

const { ipcMain } = IPC;

// The worker.
let worker: Maybe<Worker>;

/**
 * The user wants to answer a question.
 * @param answer Their answer.
 */
export async function handleAnswerQuestion(answer: Answer) {
  if (worker == null) return bad("System is not running!");

  worker.postMessage({ type: "answer", ...answer } as WorkerRequest);
  return good(undefined);
}

/**
 * The user wants to ungracefully kill the program.
 */
export async function handleCancelProgram() {
  if (worker == null) return bad("System is not running!");

  worker.terminate();
  worker = null;

  return good(undefined);
}

/**
 * The user watns to gracefully exit the program.
 */
export async function handleExitProgram() {
  if (worker == null) return bad("System is not running!");

  worker.postMessage({ type: "exit" } as WorkerRequest);
  return good(undefined);
}

/**
 * The user wishes to ignore all future questions from the worker.
 */
export async function handleIgnoreAll() {
  if (worker == null) return bad("System is not running!");
  
  worker.postMessage({ type: "ignore_all" } as WorkerRequest);
  return good(undefined);
}

/**
 * Handle when a worker has a message for the user.
 * @param mainWindow The current window.
 * @param message The message.
 */
function handleWorkerMessage(mainWindow: BrowserWindow, message: unknown) {
  const response_parse = WorkerResponseSchema.safeParse(message);
  if (!response_parse.success) {
    ipcMain.invoke.runnerUpdate(mainWindow, { type: "error", message: z.prettifyError(response_parse.error) });
    return;
  }

  const { data } = response_parse;
  switch (data.type) {
    case "status": {
      if (data.status.type === "error" || data.status.type === "done") {
        worker?.terminate();
      }

      ipcMain.invoke.runnerUpdate(mainWindow, data.status);
    } break;
    case "question": {
      ipcMain.invoke.runnerQuestion(mainWindow, data);
    }
  }
}

/**
 * The user wishes to forcefully restart the program.
 * @param mainWindow The current window.
 * @param workerData The settings data the user wishes to send.
 */
export async function handleRunProgram(mainWindow: BrowserWindow, workerData: Maybe<SettingsData>) {
  // Kill the worker, if running.
  if (worker != null) {
    await worker.terminate();
    worker = null;
  }
  
  // There must be data.
  if (workerData == null) {
    return bad("Cannot give empty settings.");
  }
  
  // Create new worker.
  worker = new Worker(path.join(__dirname, 'worker.js'), { workerData });
  worker.on("message", handleWorkerMessage);
  worker.on("exit", () => worker = null);

  return good(undefined);
}

/** ------------------------------------------------------------------------- */

/**
 * Handle all interaction between the main thread and the renderer.
 * @param mainWindow The renderer.
 */
export function handleIPC(mainWindow: BrowserWindow) {
  // Create on window open.
  ipcMain.handle.chooseDir();
  ipcMain.handle.getPing();
  ipcMain.handle.getSettings();
  ipcMain.handle.setSettings();
  ipcMain.handle.openDir();
  ipcMain.handle.getTransformers();
  ipcMain.handle.openOutputFile();
  ipcMain.handle.getAllQuarters();
  ipcMain.handle.createQuarter();

  ipcMain.handle.answerQuestion(async (_, { data }) => handleAnswerQuestion(data));
  ipcMain.handle.cancelProgram(handleCancelProgram);
  ipcMain.handle.exitProgram(handleExitProgram);
  ipcMain.handle.ignoreAll(handleIgnoreAll)
  ipcMain.handle.runProgram(async (_, { data }) => handleRunProgram(mainWindow, data));

  // Remove on window close.
  mainWindow.on("close", () => {
    ipcMain.remove.answerQuestion();
    ipcMain.remove.chooseDir();
    ipcMain.remove.getPing();
    ipcMain.remove.getSettings();
    ipcMain.remove.getTransformers();
    ipcMain.remove.openDir();
    ipcMain.remove.runProgram();
    ipcMain.remove.setSettings();
    ipcMain.remove.openOutputFile();
    ipcMain.remove.getAllQuarters();
    ipcMain.remove.createQuarter();
    ipcMain.remove.ignoreAll();
  });
}