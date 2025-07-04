import { app, BrowserWindow } from 'electron';
import path from 'node:path';
import started from 'electron-squirrel-startup';
import IPC from './shared/ipc';
import Settings from './shared/settings';
import { BasicState } from './system/information/State';
import { CLIRunner } from './system/runner/CLIRunner';

/** ------------------------------------------------------------------------- */

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      sandbox: false,
      nodeIntegrationInWorker: true
    },
    icon: './images/icon.png'
  });

  // Allow all handlers.
  IPC.ipcMain.handle.chooseDir();
  IPC.ipcMain.handle.getPing();
  IPC.ipcMain.handle.getSettings();
  IPC.ipcMain.handle.setSettings();
  
  IPC.ipcMain.handle.runProgram(async (_, { runProgram, data } ) => {
    const result = await runProgram(_, data);

    const settings = Settings.parse(data);
    const time: Time = { quarter: 4, year: 2024 };
    const state = new BasicState(time, settings);
    const runner = new CLIRunner({
      quiet: true,
      onStatus: status => IPC.ipcMain.invoke.runnerUpdate(mainWindow, status)
    });

    void runner.run(state);

    return result;
  })

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }

  // Open the DevTools.
  if (!app.isPackaged) {
    mainWindow.webContents.openDevTools();
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
