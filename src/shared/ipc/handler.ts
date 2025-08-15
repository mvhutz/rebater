import { bad, good } from "../reply";
import { SettingsData } from "../settings";
import { Answer, WorkerRequest } from "../worker/request";
import { SystemStatus, WorkerResponse } from "../worker/response";
import { BrowserWindow } from "electron";
import IPC from ".";
import { ModuleThread, spawn, Worker } from "threads";
import { System } from "../../worker";

/** ------------------------------------------------------------------------- */

const { ipcMain } = IPC;

export class IPCHandler {
  private window: BrowserWindow;
  private worker: Worker;
  private thread: ModuleThread<System>;

  constructor(window: BrowserWindow, worker: Worker, thread: ModuleThread<System>) {
    this.worker = worker;
    this.thread = thread;
    this.window = window;
  }

  static async create(window: BrowserWindow): Promise<IPCHandler> {
    const worker = new Worker('worker.js');
    const thread = await spawn<System>(worker);

    return new IPCHandler(window, worker, thread);
  }

  /**
   * The user wants to answer a question.
   * @param answer Their answer.
   */
  async handleAnswerQuestion(answer: Answer) {
    await this.thread.saveAnswer(answer);
    return good(undefined);
  }

  /**
   * The user wants to ungracefully kill the program.
   */
  async handleCancelProgram() {
    this.worker.terminate();
    this.worker = new Worker('worker.js');
    this.thread = await spawn<System>(this.worker);

    return good(undefined);
  }

  /**
   * The user wants to gracefully exit the program.
   */
  handleExitProgram() {
    this.worker.postMessage({ type: "exit" } as WorkerRequest);
    return good(undefined);
  }

  /**
   * The worker sends the handler a status message.
   */
  private handleWorkerStatus(status: SystemStatus) {
    ipcMain.invoke.runnerUpdate(this.window, status);
  }

  /**
   * Handle when a worker has a message for the user.
   * @param mainWindow The current window.
   * @param message The message.
   */
  private handleWorkerMessage(message: WorkerResponse) {
    switch (message.type) {
      case "status":
        this.handleWorkerStatus(message.status);
        break;
      case "question":
        ipcMain.invoke.runnerQuestion(this.window, message);
        break;
    }
  }
  
  /**
   * Handle all interaction between the main thread and the renderer.
   * @param mainWindow The renderer.
   */
  async handleRunProgram(settings: Maybe<SettingsData>) {
    // There must be data.
    if (settings == null) {
      return bad("Cannot give empty settings.");
    }
    
    // Create new worker.
    await this.handleCancelProgram();

    const observable = this.thread.run(settings);
    observable.subscribe(m => this.handleWorkerMessage(m));

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

    ipcMain.handle.answerQuestion(async (_, { data }) => await this.handleAnswerQuestion(data));
    ipcMain.handle.cancelProgram(async () => await this.handleCancelProgram());
    ipcMain.handle.exitProgram(async () => this.handleExitProgram());
    ipcMain.handle.runProgram(async (_, { data }) => await this.handleRunProgram(data));

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
    });
  }
}
