import { bad, good, Reply } from "../reply";
import { Settings, SettingsData } from "../settings";
import { Answer, WorkerRequest } from "../worker/request";
import { SystemStatus, WorkerResponse } from "../worker/response";
import { app, BrowserWindow } from "electron";
import IPC from ".";
import { ModuleThread, spawn, Worker } from "threads";
import { System } from "../../worker";
import path from "path";
import { TransformerData } from "../transformer";
import { Repository } from "../state/Repository";
import { TransformerFile } from "../state/stores/TransformerStore";

/** ------------------------------------------------------------------------- */

const { ipcMain } = IPC;

export class IPCHandler {
  public static readonly SETTINGS_FILE = path.join(app.getPath("userData"), "settings.json");
  private window: BrowserWindow;
  private worker: Worker;
  private thread: ModuleThread<System>;
  private repository: Repository;

  constructor(window: BrowserWindow, worker: Worker, thread: ModuleThread<System>) {
    this.worker = worker;
    this.thread = thread;
    this.window = window;
    this.repository = new Repository(IPCHandler.SETTINGS_FILE);
  }

  /** ----------------------------------------------------------------------- */

  async getTransformers(): Promise<Reply<TransformerFile[]>> {
    const repository_reply = this.repository.getState();
    if (!repository_reply.ok) return bad("Data not loaded!");
    const { data: repository } = repository_reply;

    return good(repository.transformers.getEntries().toArray());
  }

  async createTransformer(data: TransformerData): Promise<Reply<TransformerFile>> {
    // const repo = this.connection.getRepository(TransformerEntity);
    // const built = new TransformerEntity();
    // built.data = data;
    // const saved = await repo.save(built);
    // return good(saved.id);
    void [data];
    return bad("Not yet!");
  }

  async deleteTransformer(file: TransformerFile): Promise<Reply> {
    // const repo = this.connection.getRepository(TransformerEntity);
    // const result = await repo.delete({ id });

    // return good(result.affected ?? 0);
    void [file];
    return bad("Not yet!");
  }

  async updateTransformer(file: TransformerFile): Promise<Reply> {
    // const repo = this.connection.getRepository(TransformerEntity);
    // const result = await repo.update({ id: options.id }, { data: options.data });
  
    // return good(result.affected ?? 0);
    void [file];
    return bad("Not yet!");
  }

  /** ----------------------------------------------------------------------- */

  async getSettingsData() {
    return this.repository.settings.getSchema();
  }

  async setSettingsData(data: SettingsData) {
    await this.repository.settings.setData(new Settings(data));
    return good("Settings saved!");
  }

  static async create(window: BrowserWindow): Promise<IPCHandler> {
    const worker = new Worker('worker.js', { workerData: IPCHandler.SETTINGS_FILE });
    const thread = await spawn<System>(worker);


    const handler = new IPCHandler(window, worker, thread);
    return handler;
  }

  /**
   * The user wants to answer a question.
   * @param answer Their answer.
   */
  async handleAnswerQuestion(answer: Answer) {
    const state_reply = this.repository.getState();
    if (!state_reply.ok) return state_reply;

    const { data: state } = state_reply;
    await state.tracker.answer(answer);
    
    const table = state.references.getTable(answer.reference);
    const modified = table.insert(answer.answer);
    await state.references.updateTable(answer.reference, modified);
    return good(undefined);
  }

  /**
   * The user wants to ungracefully kill the program.
   */
  async handleCancelProgram() {
    this.worker.terminate();
    this.worker = new Worker('worker.js', { workerData: IPCHandler.SETTINGS_FILE });
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
  async handleRunProgram() {    
    // Create new worker.
    const observable = this.thread.run();
    observable.subscribe(m => this.handleWorkerMessage(m));

    return good(undefined);
  }

  handleIPC() {
    // Create on window open.
    ipcMain.handle.chooseDir();
    ipcMain.handle.getPing();
    ipcMain.handle.openDir();
    ipcMain.handle.openOutputFile();
    ipcMain.handle.getAllQuarters();
    ipcMain.handle.createQuarter();

    ipcMain.handle.getTransformers(async () => await this.getTransformers());
    ipcMain.handle.createTransformer(async (_, { data }) => await this.createTransformer(data));
    ipcMain.handle.deleteTransformer(async (_, { data }) => await this.deleteTransformer(data));
    ipcMain.handle.updateTransformer(async (_, { data }) => await this.updateTransformer(data));
    ipcMain.handle.getSettings(async () => await this.getSettingsData());
    ipcMain.handle.setSettings(async (_, { data }) => await this.setSettingsData(data));

    ipcMain.handle.answerQuestion(async (_, { data }) => await this.handleAnswerQuestion(data));
    ipcMain.handle.cancelProgram(async () => await this.handleCancelProgram());
    ipcMain.handle.exitProgram(async () => this.handleExitProgram());
    ipcMain.handle.runProgram(async () => await this.handleRunProgram());

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
      ipcMain.remove.createTransformer();
      ipcMain.remove.deleteTransformer();
      ipcMain.remove.updateTransformer();
    });
  }
}
