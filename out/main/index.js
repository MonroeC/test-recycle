"use strict";
const electron = require("electron");
const utils = require("@electron-toolkit/utils");
const os = require("os");
const si = require("systeminformation");
const lowdb = require("lowdb");
const node = require("lowdb/node");
const path = require("path");
const usb = require("usb");
const icon = path.join(__dirname, "../../resources/icon.png");
const fs$1 = require("fs");
const getFileCount = (filePath2) => {
  try {
    const files = fs$1.readdirSync(filePath2);
    const fileCount = files.length;
    return fileCount;
  } catch (error) {
    console.error("Error reading directory:", error);
    return 0;
  }
};
const { join } = (() => {
  const mod = require("path");
  return mod && mod.__esModule ? mod : Object.assign(/* @__PURE__ */ Object.create(null), mod, { default: mod, [Symbol.toStringTag]: "Module" });
})();
const { default: fs } = (() => {
  const mod = require("fs");
  return mod && mod.__esModule ? mod : Object.assign(/* @__PURE__ */ Object.create(null), mod, { default: mod, [Symbol.toStringTag]: "Module" });
})();
const homeDirectory = os.homedir();
const filePath = `${homeDirectory}/recyclePictures`;
console.log(filePath, "filePath");
if (!fs.existsSync(filePath)) {
  fs.mkdirSync(filePath);
  console.log("create dir success");
} else {
  console.log("dir already exists");
}
function createWindow() {
  const mainWindow = new electron.BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...process.platform === "linux" ? { icon } : {},
    webPreferences: {
      preload: join(__dirname, "../preload/index.js"),
      sandbox: false
    },
    fullscreen: true
  });
  mainWindow.webContents.openDevTools();
  new lowdb.Low(new node.JSONFile("file.json"), {});
  usb.on("attach", (device) => {
    console.log("attcah device", device);
    mainWindow?.webContents.send("usb-change-device", device);
  });
  usb.on("detach", (device) => {
    console.log("detach device", device);
    mainWindow?.webContents.send("usb-change-device", device);
  });
  fs.watchFile(filePath, () => {
    const fileCount = getFileCount(filePath);
    mainWindow?.webContents.send("file-count-changed", fileCount);
  });
  mainWindow.on("ready-to-show", () => {
    mainWindow.show();
    const fileCount = getFileCount(filePath);
    mainWindow?.webContents.send("file-count-changed", fileCount);
    mainWindow?.webContents.send("recycle-pictures-filePath", filePath);
    si.system().then((data) => {
      mainWindow?.webContents.send("system-info", data);
    });
  });
  mainWindow.webContents.setWindowOpenHandler((details) => {
    electron.shell.openExternal(details.url);
    return { action: "deny" };
  });
  if (utils.is.dev && process.env["ELECTRON_RENDERER_URL"]) {
    mainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"]);
  } else {
    mainWindow.loadFile(join(__dirname, "../renderer/index.html"));
  }
}
electron.app.whenReady().then(() => {
  utils.electronApp.setAppUserModelId("com.electron");
  electron.app.on("browser-window-created", (_, window) => {
    utils.optimizer.watchWindowShortcuts(window);
  });
  electron.ipcMain.on("ping", () => console.log("pong"));
  electron.ipcMain.on("create-pictures-dir", (_event, arg) => {
    console.error(arg, "arg");
    const dir = `${homeDirectory}/recyclePictures/${arg}`;
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
  });
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
