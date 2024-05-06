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
const icon = path$2.join(__dirname, "../../resources/icon.png");
const fs$2 = require("fs");
const path$1 = require("path");
const getFileCount = function(dir) {
  const res = [];
  function traverse(dir2) {
    fs$2.readdirSync(dir2).forEach((file) => {
      const pathname = path$1.join(dir2, file);
      if (fs$2.statSync(pathname).isDirectory()) {
        traverse(pathname);
      } else {
        res.push(pathname);
      }
    });
  }
  traverse(dir);
  return res?.length;
};
const fs$1 = require("fs");
const path = require("path");
const getFiles = function(dir) {
  const res = [];
  function traverse(dir2) {
    fs$1.readdirSync(dir2).forEach((file) => {
      const pathname = path.join(dir2, file);
      if (fs$1.statSync(pathname).isDirectory()) {
        traverse(pathname);
      } else {
        res.push(pathname);
      }
    });
  }
  traverse(dir);
  return res;
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
const adapter = new FileSync(`${homeDirectory}/db.json`);
const db = low(adapter);
db.defaults({ recycleInfos: [] }).write();
console.log(db.get("recycleInfos").value(), "recycleInfos");
function createWindow() {
  const mainWindow = new electron.BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    // autoHideMenuBar: true,
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
    db.get("recycleInfos").push({ [arg]: infos }).write();
    data.append("deviceSn", "LBCDJSB001");
    const config = {
      method: "post",
      maxBodyLength: Infinity,
      url: "http://172.16.15.168:8080/api/common/terminalRecycle",
      headers: {
        "content-type": "multipart/form-data"
      },
      data
    };
    axios.request(config).then((response) => {
      console.log(JSON.stringify(response.data));
      db.get("recycleInfos").find({ parentPath: arg }).assign({ isUpload: true }).write();
      event.reply("picture-save-response", response.data);
    }).catch((error) => {
      console.log(error);
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
