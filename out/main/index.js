"use strict";
const electron = require("electron");
const utils = require("@electron-toolkit/utils");
const os = require("os");
const si = require("systeminformation");
const path$2 = require("path");
const usb = require("usb");
const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");
const pino = require("pino");
const axios = require("axios");
const FormData = require("form-data");
const uuid = require("node-uuid");
const moment = require("moment");
const icon = path$2.join(__dirname, "../../resources/icon.png");
const fs$4 = require("fs");
const removeFileDir = (path2) => {
  const files = fs$4.readdirSync(path2);
  for (const item of files) {
    const stats = fs$4.statSync(`${path2}/${item}`);
    if (stats.isDirectory()) {
      removeFileDir(`${path2}/${item}`);
    } else {
      fs$4.unlinkSync(`${path2}/${item}`);
    }
  }
  fs$4.rmdirSync(path2);
};
const fs$3 = require("fs");
const path$1 = require("path");
const getFiles = function(dir) {
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
  return res;
};
const { default: fs$2 } = (() => {
  const mod = require("fs");
  return mod && mod.__esModule ? mod : Object.assign(/* @__PURE__ */ Object.create(null), mod, { default: mod, [Symbol.toStringTag]: "Module" });
})();
const SCANNER_VENDOR_ID$1 = 1208;
const SCANNER_PRODUCT_ID$1 = 359;
const logger$1 = pino();
const homeDirectory$1 = os.homedir();
const filePath$1 = `${homeDirectory$1}/recyclePictures`;
const createDir = (filePath2) => {
  if (!fs$2.existsSync(filePath2)) {
    fs$2.mkdirSync(filePath2);
    console.log("create dir success");
  } else {
    console.log("dir already exists");
  }
};
const checkScannerStatus = (cb) => {
  const devices = usb.getDeviceList();
  const scannerConnected = devices.some(
    (device) => device.deviceDescriptor.idVendor === SCANNER_VENDOR_ID$1 && device.deviceDescriptor.idProduct === SCANNER_PRODUCT_ID$1
  );
  if (scannerConnected) {
    console.log("Scanner is connected.");
    cb && cb(true);
  } else {
    console.log("Scanner is not connected.");
    cb && cb(false);
  }
};
const checkRestFiles = (cb) => {
  fs$2.readdir(filePath$1, { withFileTypes: true }, (err, files) => {
    if (err) {
      console.log("Error reading directory:", err);
      return;
    }
    const folders = files.filter((file) => file.isDirectory()).map((folder) => folder.name);
    folders?.forEach((one) => {
      if (getFiles(`${filePath$1}/${one}`)?.length) {
        cb && cb(`${filePath$1}/${one}`);
      }
    });
    console.log(folders);
  });
};
const savePicture = (arg, db2, event) => {
  event?.reply("picture-save-response", "loading");
  const files = getFiles(arg);
  const data = new FormData();
  const infos = [];
  files?.forEach((one) => {
    data.append("files", fs$2.createReadStream(one));
    infos.push({
      filePath: one,
      createTime: moment().format("YYYY-MM-DD HH:mm:ss"),
      parentPath: arg,
      isUpload: false,
      id: uuid.v4()
    });
  });
  data.append("deviceSn", "LBCDJSB001");
  db2.get("recycleInfos").push(...infos).write();
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
    logger$1.info(JSON.stringify(response.data));
    event?.reply("picture-save-response", response.data);
    db2.get("recycleInfos").filter({ parentPath: arg }).each((one) => {
      one.isUpload = true;
      one.updateTime = moment().format("YYYY-MM-DD HH:mm:ss");
    }).write();
    removeFileDir(arg);
  }).catch((error) => {
    logger$1.info(error);
    event?.reply("picture-save-response", error?.data);
  });
};
const fs$1 = require("fs");
const path = require("path");
const getFileCount = function(dir) {
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
  return res?.length;
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
createDir(filePath);
const adapter = new FileSync(`${homeDirectory}/db.json`);
const db = low(adapter);
db.defaults({ recycleInfos: [], isAuto: false }).write();
const SCANNER_VENDOR_ID = 1208;
const SCANNER_PRODUCT_ID = 359;
const INTERVAL_TIME = 6e4;
let mainWindow;
function createWindow() {
  mainWindow = new electron.BrowserWindow({
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
  mainWindow.on("ready-to-show", () => {
    mainWindow.show();
    checkScannerStatus((value) => {
      mainWindow?.webContents.send("usb-change-device", value);
    });
    checkInterval();
    const fileCount = getFileCount(filePath);
    mainWindow?.webContents.send("file-count-changed", fileCount);
    mainWindow?.webContents.send("recycle-pictures-filePath", filePath);
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
const checkInterval = () => {
  setInterval(() => {
    checkRestFiles((value) => savePicture(value, db, null));
  }, INTERVAL_TIME);
};
fs.watch(filePath, () => {
  const fileCount = getFileCount(filePath);
  mainWindow?.webContents.send("file-count-changed", fileCount);
});
usb.on("attach", (device) => {
  console.log("attached:");
  if (device.deviceDescriptor.idVendor === SCANNER_VENDOR_ID && device.deviceDescriptor.idProduct === SCANNER_PRODUCT_ID) {
    console.log("Scanner attached:");
    mainWindow?.webContents.send("usb-change-device", true);
  }
});
usb.on("detach", (device) => {
  console.log("detach:");
  if (device.deviceDescriptor.idVendor === SCANNER_VENDOR_ID && device.deviceDescriptor.idProduct === SCANNER_PRODUCT_ID) {
    mainWindow?.webContents.send("usb-change-device", false);
  }
});
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
    savePicture(arg, db, event);
  });
  createWindow();
  electron.app.on("activate", function() {
    if (electron.BrowserWindow.getAllWindows().length === 0)
      createWindow();
  });
});
electron.app.on("window-all-closed", () => {
  clearInterval(checkInterval);
  if (process.platform !== "darwin") {
    electron.app.quit();
  }
});
