'use strict';

require('@electron/remote/main').initialize();
import { app, BrowserWindow, ipcMain, Menu, protocol } from 'electron';
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib';

const isDevelopment = !!process.env.WEBPACK_DEV_SERVER_URL;

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } },
]);

async function createWindow() {
  // Create the browser window.
  const win = new BrowserWindow({
    width: 1300,
    height: 800,
    frame: false,
    maximizable: false,
    fullscreenable: false,
    resizable: false,
    focusable: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
      // This is a way to bypass CORS but this is not secure at all
      webSecurity: false,
    },
  });

  require('@electron/remote/main').enable(win.webContents);

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL);
    // if (isDevelopment) win.webContents.openDevTools();
  } else {
    createProtocol('app');
    // Load the index.html when not in development
    await win.loadURL('app://./index.html');
  }
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
  else BrowserWindow.getAllWindows().forEach((win) => win.show());
});

let isConnected = false;
ipcMain.on('ConnectionState', (_, connected) => {
  if (isConnected !== connected) {
    isConnected = connected;
    setupDock();
  }
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  createWindow();

  setupDock();
});

function setupDock() {
  if (process.platform === 'darwin') {
    const dockMenu = Menu.buildFromTemplate([
      {
        label: 'Reload Config',
        click() {
          BrowserWindow.getAllWindows().forEach((win) =>
            win.webContents.send('Action', 'ReloadConfig')
          );
        },
        enabled: isConnected,
      },
      {
        label: 'Start HybrProxy',
        click() {
          BrowserWindow.getAllWindows().forEach((win) =>
            win.webContents.send('Action', 'StartProcess')
          );
        },
        enabled: !isConnected,
      },
      {
        label: 'Kill Process',
        click() {
          BrowserWindow.getAllWindows().forEach((win) =>
            win.webContents.send('Action', 'KillProcess')
          );
        },
        enabled: isConnected,
      },
    ]);

    app.dock.setMenu(dockMenu);
  }
}
