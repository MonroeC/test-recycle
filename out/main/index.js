"use strict";
const electron = require("electron");
const path = require("path");
const utils = require("@electron-toolkit/utils");
const fs$1 = require("fs");
const os = require("os");
const icon = path.join(__dirname, "../../resources/icon.png");
const fs = require("fs");
require("path");
const getFileCount = (filePath2) => {
  try {
    const files = fs.readdirSync(filePath2);
    const fileCount = files.length;
    return fileCount;
  } catch (error) {
    console.error("Error reading directory:", error);
    return 0;
  }
};
const homeDirectory = os.homedir();
const filePath = `${homeDirectory}/Documents/recyclePictures`;
function createWindow() {
  const mainWindow = new electron.BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...process.platform === "linux" ? { icon } : {},
    webPreferences: {
      preload: path.join(__dirname, "../preload/index.js"),
      sandbox: false
    },
    fullscreen: true
  });
  mainWindow.webContents.openDevTools();
  fs$1.watchFile(filePath, (curr, prev) => {
    console.log("File changed:", filePath);
    const fileCount = getFileCount(filePath);
    console.log(fileCount, "fileCount");
    mainWindow?.webContents.send("file-count-changed", fileCount);
  });
  mainWindow.on("ready-to-show", () => {
    mainWindow.show();
    const fileCount = getFileCount(filePath);
    console.log(fileCount, "fileCount");
    mainWindow?.webContents.send("file-count-changed", fileCount);
  });
  mainWindow.webContents.setWindowOpenHandler((details) => {
    electron.shell.openExternal(details.url);
    return { action: "deny" };
  });
  if (utils.is.dev && process.env["ELECTRON_RENDERER_URL"]) {
    mainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"]);
  } else {
    mainWindow.loadFile(path.join(__dirname, "../renderer/index.html"));
  }
}
electron.app.whenReady().then(() => {
  utils.electronApp.setAppUserModelId("com.electron");
  electron.app.on("browser-window-created", (_, window) => {
    utils.optimizer.watchWindowShortcuts(window);
  });
  electron.ipcMain.on("ping", () => console.log("pong"));
  createWindow();
  electron.app.on("activate", function() {
    if (electron.BrowserWindow.getAllWindows().length === 0)
      createWindow();
  });
});
electron.app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    electron.app.quit();
  }
});
