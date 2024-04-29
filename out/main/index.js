"use strict";
const electron = require("electron");
const utils = require("@electron-toolkit/utils");
const os = require("os");
const si = require("systeminformation");
const path = require("path");
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
if (!fs.existsSync(filePath)) {
  fs.mkdirSync(filePath);
  console.log("创建文件夹成功");
} else {
  console.log("文件夹已存在");
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
  fs.watchFile(filePath, () => {
    const fileCount = getFileCount(filePath);
    mainWindow?.webContents.send("file-count-changed", fileCount);
  });
  mainWindow.on("ready-to-show", () => {
    mainWindow.show();
    const fileCount = getFileCount(filePath);
    mainWindow?.webContents.send("file-count-changed", fileCount);
    si.system().then((data) => {
      console.log(data, "system-info");
      mainWindow?.webContents.send("system-info", data);
    });
    si.cpu().then((data) => {
      console.log(data, "cpu-info");
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
