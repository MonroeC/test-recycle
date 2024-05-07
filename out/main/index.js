"use strict";
const electron = require("electron");
const utils = require("@electron-toolkit/utils");
const os = require("os");
const si = require("systeminformation");
const path$2 = require("path");
const usb = require("usb");
const axios = require("axios");
const FormData = require("form-data");
const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");
const uuid = require("node-uuid");
const pino = require("pino");
const icon = path$2.join(__dirname, "../../resources/icon.png");
const fs$3 = require("fs");
const path$1 = require("path");
const getFileCount = function(dir) {
  const res = [];
  function traverse(dir2) {
    fs$3.readdirSync(dir2).forEach((file) => {
      const pathname = path$1.join(dir2, file);
      if (fs$3.statSync(pathname).isDirectory()) {
        traverse(pathname);
      } else {
        res.push(pathname);
      }
    });
  }
  traverse(dir);
  return res?.length;
};
const fs$2 = require("fs");
const path = require("path");
const getFiles = function(dir) {
  const res = [];
  function traverse(dir2) {
    fs$2.readdirSync(dir2).forEach((file) => {
      const pathname = path.join(dir2, file);
      if (fs$2.statSync(pathname).isDirectory()) {
        traverse(pathname);
      } else {
        res.push(pathname);
      }
    });
  }
  traverse(dir);
  return res;
};
const fs$1 = require("fs");
const removeFileDir = (path2) => {
  const files = fs$1.readdirSync(path2);
  for (const item of files) {
    const stats = fs$1.statSync(`${path2}/${item}`);
    if (stats.isDirectory()) {
      removeFileDir(`${path2}/${item}`);
    } else {
      fs$1.unlinkSync(`${path2}/${item}`);
    }
  }
  fs$1.rmdirSync(path2);
};
const { join } = (() => {
  const mod = require("path");
  return mod && mod.__esModule ? mod : Object.assign(/* @__PURE__ */ Object.create(null), mod, { default: mod, [Symbol.toStringTag]: "Module" });
})();
const { default: fs } = (() => {
  const mod = require("fs");
  return mod && mod.__esModule ? mod : Object.assign(/* @__PURE__ */ Object.create(null), mod, { default: mod, [Symbol.toStringTag]: "Module" });
})();
const logger = pino();
const homeDirectory = os.homedir();
const filePath = `${homeDirectory}/recyclePictures`;
logger.info(filePath, "filePath");
if (!fs.existsSync(filePath)) {
  fs.mkdirSync(filePath);
  console.log("create dir success");
} else {
  console.log("dir already exists");
}
const adapter = new FileSync(`${homeDirectory}/db.json`);
const db = low(adapter);
db.defaults({ recycleInfos: [], isAuto: false }).write();
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
  usb.on("attach", (device) => {
    mainWindow?.webContents.send("usb-change-device", device);
  });
  usb.on("detach", (device) => {
    mainWindow?.webContents.send("usb-change-device", device);
  });
  fs.watch(filePath, () => {
    const fileCount = getFileCount(filePath);
    mainWindow?.webContents.send("file-count-changed", fileCount);
  });
  mainWindow.on("ready-to-show", () => {
    mainWindow.show();
    const fileCount = getFileCount(filePath);
    mainWindow?.webContents.send("file-count-changed", fileCount);
    mainWindow?.webContents.send("recycle-pictures-filePath", filePath);
    logger.info(db.get("isAuto").value(), 999);
    mainWindow?.webContents.send("change-auto-response", db.get("isAuto").value());
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
  electron.ipcMain.on("ping", () => logger.info("pong"));
  electron.ipcMain.on("create-pictures-dir", (_event, arg) => {
    logger.info(arg, "arg");
    const dir = `${homeDirectory}/recyclePictures/${arg}`;
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
  });
  electron.ipcMain.on("change-auto", (event, arg) => {
    db.update("isAuto", () => arg).write();
    event.reply("change-auto-response", arg);
  });
  electron.ipcMain.on("picture-save", (event, arg) => {
    const files = getFiles(arg);
    const data = new FormData();
    const splits = arg?.split("/");
    const time = splits?.[splits?.length - 1];
    const infos = [];
    files?.forEach((one) => {
      data.append("files", fs.createReadStream(one));
      infos.push({
        filePath: one,
        createTime: time,
        parentPath: arg,
        isUpload: false,
        id: uuid.v4()
      });
    });
    data.append("deviceSn", "LBCDJSB001");
    db.get("recycleInfos").push(...infos).write();
    const config = {
      method: "post",
      maxBodyLength: Infinity,
      url: "https://zz-test05.pinming.org/material-client-management/api/common/terminalRecycle",
      // url: 'http://172.16.15.168:8080/api/common/terminalRecycle',
      headers: {
        "content-type": "multipart/form-data"
      },
      data
    };
    axios.request(config).then((response) => {
      logger.info(JSON.stringify(response.data));
      event.reply("picture-save-response", response.data);
      db.get("recycleInfos").filter({ parentPath: arg }).each((one) => one.isUpload = true).write();
      removeFileDir(arg);
    }).catch((error) => {
      logger.info(error);
      event.reply("picture-save-response", error?.data);
    });
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
