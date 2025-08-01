import { app, BrowserWindow } from 'electron';
import path from 'path';
import started from 'electron-squirrel-startup';
import IPC from './shared/ipc';
import { Worker } from 'worker_threads';
import { bad, good } from './shared/reply';
import { WorkerRequest } from './shared/worker/request';
import { WorkerResponseSchema } from './shared/worker/response';
import z from 'zod/v4';

/** ------------------------------------------------------------------------- */

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

const { ipcMain } = IPC;

async function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      sandbox: false,
      nodeIntegrationInWorker: true
    },
    autoHideMenuBar: true,
    icon: './images/icon.png'
  });

  // Allow all handlers.
  ipcMain.handle.chooseDir();
  ipcMain.handle.getPing();
  ipcMain.handle.getSettings();
  ipcMain.handle.setSettings();
  ipcMain.handle.openDir();
  ipcMain.handle.getTransformers();
  ipcMain.handle.openOutputFile();
  ipcMain.handle.getAllQuarters();
  ipcMain.handle.createQuarter();

  // Talking with system.
  let worker: Maybe<Worker>;

  ipcMain.handle.answerQuestion(async (_, { data }) => {
    if (worker == null) return bad("System is not running!");

    worker.postMessage({ type: "answer", question: data.question, answer: data.value } as WorkerRequest);
    return good(undefined);
  });

  ipcMain.handle.cancelProgram(async () => {
    if (worker == null) return bad("System is not running!");

    await worker.terminate();
    worker = null;

    return good(undefined);
  });

  ipcMain.handle.exitProgram(async () => {
    if (worker == null) return bad("System is not running!");

    worker.postMessage({ type: "exit" } as WorkerRequest);
    return good(undefined);
  });

  ipcMain.handle.ignoreAll(async () => {
    if (worker == null) return bad("System is not running!");
    
    worker.postMessage({ type: "ignore_all" } as WorkerRequest);
    return good(undefined);
  })

  ipcMain.handle.runProgram(async (_, { data }) => {
    if (worker != null) {
      await worker.terminate();
      worker = null;
    }
    
    if (data == null) {
      return bad("Cannot give empty settings.");
    }

    worker = new Worker(path.join(__dirname, 'worker.js'), {
      workerData: data
    });
    
    worker.on("message", message => {
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
          ipcMain.invoke.runnerQuestion(mainWindow, data.question);
        }
      }
    });

    worker.on("exit", () => worker = null);

    return good(undefined);
  });

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

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
