import path from "path";
import { Worker } from 'worker_threads';
import { bad, good } from "../reply";
import { SettingsData } from "../settings";
import { Answer, WorkerRequest } from "../worker/request";
import { SystemStatus, WorkerResponseSchema } from "../worker/response";
import { BrowserWindow } from "electron";
import IPC from ".";
import z from "zod/v4";

/** ------------------------------------------------------------------------- */

const { ipcMain } = IPC;

export class IPCHandler {
  private window: BrowserWindow;
  private worker: Maybe<Worker>;

  constructor(window: BrowserWindow) {
    this.worker = null;
    this.window = window;
  }

  /**
   * The user wants to answer a question.
   * @param answer Their answer.
   */
  handleAnswerQuestion(answer: Answer) {
    if (this.worker == null) return bad("System is not running!");

    this.worker.postMessage({ type: "answer", ...answer } as WorkerRequest);
    return good(undefined);
  }

  /**
   * The user wants to ungracefully kill the program.
   */
  handleCancelProgram() {
    if (this.worker == null) return bad("System is not running!");

    this.worker.terminate();
    this.worker = null;

    return good(undefined);
  }

  /**
   * The user wants to gracefully exit the program.
   */
  handleExitProgram() {
    if (this.worker == null) return bad("System is not running!");

    this.worker.postMessage({ type: "exit" } as WorkerRequest);
    return good(undefined);
  }

  /**
   * The user wishes to ignore all future questions from the worker.
   */
  handleIgnoreAll() {
    if (this.worker == null) return bad("System is not running!");
    
    this.worker.postMessage({ type: "ignore_all" } as WorkerRequest);
    return good(undefined);
  }

  /**
   * The worker sends the handler a status message.
   */
  private handleWorkerStatus(status: SystemStatus) {
    if (status.type === "error" || status.type === "done") {
      this.worker?.terminate();
    }

    ipcMain.invoke.runnerUpdate(this.window, status);
  }

  /**
   * Handle when a worker has a message for the user.
   * @param mainWindow The current window.
   * @param message The message.
   */
  private handleWorkerMessage(message: unknown) {
    const response_parse = WorkerResponseSchema.safeParse(message);
    if (!response_parse.success) {
      ipcMain.invoke.runnerUpdate(this.window, { type: "error", message: z.prettifyError(response_parse.error) });
      return;
    }

    const { data } = response_parse;
    switch (data.type) {
      case "status":
        this.handleWorkerStatus(data.status);
        break;
      case "question":
        ipcMain.invoke.runnerQuestion(this.window, data);
        break;
    }
  }
  
  /**
   * Handle all interaction between the main thread and the renderer.
   * @param mainWindow The renderer.
   */
  handleRunProgram(workerData: Maybe<SettingsData>) {
    // Kill the worker, if running.
    if (this.worker != null) {
      this.worker.terminate();
      this.worker = null;
    }
    
    // There must be data.
    if (workerData == null) {
      return bad("Cannot give empty settings.");
    }
    
    // Create new worker.
    this.worker = new Worker(path.join(__dirname, 'worker.js'), { workerData });
    this.worker.on("message", m => this.handleWorkerMessage(m));
    this.worker.on("exit", () => {
      this.worker = null
    });

    return good(undefined);
  }

  handleIPC() {
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

    ipcMain.handle.answerQuestion(async (_, { data }) => this.handleAnswerQuestion(data));
    ipcMain.handle.cancelProgram(async () => this.handleCancelProgram());
    ipcMain.handle.exitProgram(async () => this.handleExitProgram());
    ipcMain.handle.ignoreAll(async () => this.handleIgnoreAll());
    ipcMain.handle.runProgram(async (_, { data }) => this.handleRunProgram(data));

    // Remove on window close.
    this.window.on("close", () => {
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
}
