"use strict";
const electron = require("electron");
const path$3 = require("path");
const utils = require("@electron-toolkit/utils");
const fs$4 = require("fs");
const os = require("os");
const usb = require("usb");
const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");
const pino = require("pino");
const uuid = require("node-uuid");
const axios = require("axios");
const FormData = require("form-data");
const moment = require("moment");
const icon = path$3.join(__dirname, "../../resources/icon.png");
const fs$3 = require("fs");
const path$2 = require("path");
const moveFiles = (sourceDir, targetDir2, callBack, db2) => {
  try {
    if (!fs$3.existsSync(targetDir2)) {
      fs$3.mkdirSync(targetDir2);
    }
    const files = fs$3.readdirSync(sourceDir);
    const images = files.filter((file) => path$2.extname(file).toLowerCase() === ".jpg");
    for (let i = 0; i < images.length; i += 2) {
      const uuidTemp = uuid.v4();
      const groupFolder = path$2.join(targetDir2, uuidTemp);
      fs$3.mkdirSync(groupFolder);
      for (let j = 0; j < 2; j++) {
        if (i + j < images.length) {
          const sourceFile = path$2.join(sourceDir, images[i + j]);
          const targetFile = path$2.join(groupFolder, images[i + j]);
          db2.get("recycleInfos").push({
            isUpload: 0,
            filePath: targetFile,
            parentPath: groupFolder,
            // parentPath: `${targetDir}/${uuidTemp}`,
            isDelete: false
          }).write();
          fs$3.renameSync(sourceFile, targetFile);
        }
      }
    }
    callBack();
  } catch (error) {
    console.log(error, "error");
  }
};
const fs$2 = require("fs");
const removeFileDir = (path2) => {
  try {
    const files = fs$2.readdirSync(path2);
    for (const item of files) {
      const stats = fs$2.statSync(`${path2}/${item}`);
      if (stats.isDirectory()) {
        removeFileDir(`${path2}/${item}`);
      } else {
        fs$2.unlinkSync(`${path2}/${item}`);
      }
    }
    fs$2.rmdirSync(path2);
  } catch (error) {
    console.log(error, "remove-error");
  }
};
const fs$1 = require("fs");
const path$1 = require("path");
const getFiles = function(dir) {
  const res = [];
  function traverse(dir2) {
    fs$1.readdirSync(dir2).forEach((file) => {
      const pathname = path$1.join(dir2, file);
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
const SCANNER_VENDOR_ID$1 = 1208;
const SCANNER_PRODUCT_ID$1 = 359;
const logger$1 = pino();
const homeDirectory$1 = os.homedir();
const targetDir$1 = path$3.join(homeDirectory$1, "recycle-pictures-B");
const createDir = (filePath2) => {
  if (!fs$4.existsSync(filePath2)) {
    fs$4.mkdirSync(filePath2);
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
    cb && cb(true);
  } else {
    cb && cb(false);
  }
};
const checkRestFiles = (cb, db2) => {
  try {
    fs$4.readdir(targetDir$1, { withFileTypes: true }, (err, files) => {
      if (err) {
        console.log("Error reading directory:", err);
        return;
      }
      const folders = files.filter((file) => file.isDirectory()).map((folder) => folder.name);
      folders?.forEach((one) => {
        const isNotUplaod = db2.get("recycleInfos").filter({ isUpload: 0, isDelete: false }).value()?.length;
        if (isNotUplaod) {
          const pathname = path$3.join(targetDir$1, one);
          if (getFiles(pathname)?.length) {
            cb && cb(pathname);
          }
        }
      });
    });
  } catch (error) {
  }
};
const savePicture = async (arg, db2) => {
  try {
    const files = getFiles(arg);
    const data = new FormData();
    files?.forEach((one) => {
      data.append("files", fs$4.createReadStream(one));
    });
    const systemInfo = db2.get("systemInfo").value();
    data.append("deviceSn", systemInfo?.uuid);
    const config = {
      method: "post",
      maxBodyLength: Infinity,
      url: "https://weighmaster.pinming.cn/material-client-management/api/common/terminalRecycle",
      // url: 'http://172.16.15.168:8080/api/common/terminalRecycle',
      headers: {
        "content-type": "multipart/form-data"
      },
      data
    };
    files?.forEach((one) => {
      db2.get("recycleInfos").filter({ filePath: one }).each((one2) => {
        one2.isUpload = 1;
        one2.uploadingTime = moment().format("YYYY-MM-DD HH:mm:ss");
      }).write();
    });
    axios.request(config).then((response) => {
      if (response && response.data && response.data.success) {
        db2.get("recycleInfos").filter({ parentPath: arg }).each((one) => {
          one.isUpload = 2;
          one.uploadedTime = moment().format("YYYY-MM-DD HH:mm:ss");
          one.isDelete = true;
        }).write();
        removeFileDir(arg);
      } else {
        db2.get("recycleInfos").filter({ parentPath: arg }).each((one) => {
          one.isUpload = 0;
          one.isDelete = false;
          one.arg = arg;
          one.status = "error";
        }).write();
      }
    }).catch(() => {
      db2.get("recycleInfos").filter({ parentPath: arg }).each((one) => {
        one.isUpload = 0;
        one.status = "catch";
      }).write();
    });
  } catch (error) {
  }
};
const saveLocalPicture = (_arg, _db, event) => {
  try {
    event?.reply("picture-save-response", "success");
  } catch (error) {
    logger$1.info(error);
    event?.reply("picture-save-response", "error");
  }
};
const fs = require("fs");
const path = require("path");
const getFileCount = function(dir) {
  const res = [];
  function traverse(dir2) {
    fs.readdirSync(dir2).forEach((file) => {
      const pathname = path.join(dir2, file);
      try {
        if (fs.statSync(pathname).isDirectory()) {
          traverse(pathname);
        } else {
          res.push(pathname);
        }
      } catch (error) {
        console.log(error, 999);
      }
    });
  }
  traverse(dir);
  return res?.length;
};
const wmic = require("node-wmic");
const crypto = require("crypto");
const biosFun = async () => {
  let [bios_item] = await wmic.BIOS();
  console.log("BIOS.SerialNumber=" + bios_item.SerialNumber);
  let [cpus_item] = await wmic.CPU();
  console.log("CPU.ProcessorId=" + cpus_item.ProcessorId);
  let disks_item = await wmic.DiskDrive();
  let disksString = "";
  disks_item.forEach((element, index) => {
    disksString = disksString + (index == 0 ? "" : "@") + element.SerialNumber;
  });
  console.log("DiskDrive[0].SerialNumber=" + disks_item[0].SerialNumber);
  let [csproduct_item] = await wmic.CSProduct();
  console.log("CSProduct.UUID=" + csproduct_item.UUID);
  const License = bios_item.SerialNumber.replace(/\s*/g, "") + cpus_item.ProcessorId.replace(/\s*/g, "") + disksString.replace(/\s*/g, "") + csproduct_item.UUID.replace(/\s*/g, "");
  const hash = crypto.createHash("md5").update(License).digest("hex");
  return {
    uuid: hash
  };
};
const logger = pino();
const log = require("electron-log");
const homeDirectory = os.homedir();
const filePath = path$3.join(homeDirectory, "recycle-pictures-A");
const targetDir = path$3.join(homeDirectory, "recycle-pictures-B");
createDir(filePath);
createDir(targetDir);
const adapter = new FileSync(`${homeDirectory}/db.json`);
const db = low(adapter);
db.defaults({ recycleInfos: [], isAuto: false, systemInfo: {} }).write();
const SCANNER_VENDOR_ID = 1208;
const SCANNER_PRODUCT_ID = 359;
const INTERVAL_TIME = 5e3;
let mainWindow;
function createWindow() {
  mainWindow = new electron.BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...process.platform === "linux" ? { icon } : {},
    webPreferences: {
      preload: path$3.join(__dirname, "../preload/index.js"),
      sandbox: false
    },
    fullscreen: true
  });
  mainWindow.on("ready-to-show", () => {
    mainWindow.show();
    checkScannerStatus((value) => {
      mainWindow?.webContents.send("usb-change-device", value);
    });
    checkInterval();
    const fileCount = getFileCount(targetDir);
    mainWindow?.webContents.send("file-count-changed", fileCount);
    mainWindow?.webContents.send("recycle-pictures-filePath", filePath);
    biosFun().then((res) => {
      console.log(res, "res");
      mainWindow?.webContents.send("system-info", res);
      db.update("systemInfo", () => res).write();
    });
  });
  mainWindow.webContents.setWindowOpenHandler((details) => {
    electron.shell.openExternal(details.url);
    return { action: "deny" };
  });
  if (utils.is.dev && process.env["ELECTRON_RENDERER_URL"]) {
    mainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"]);
  } else {
    mainWindow.loadFile(path$3.join(__dirname, "../renderer/index.html"));
  }
}
const checkInterval = () => {
  setInterval(() => {
    checkRestFiles((value) => savePicture(value, db), db);
  }, INTERVAL_TIME);
};
fs$4.watch(targetDir, () => {
  const fileCount = getFileCount(targetDir);
  mainWindow?.webContents.send("file-count-changed", fileCount);
});
usb.on("attach", (device) => {
  if (device.deviceDescriptor.idVendor === SCANNER_VENDOR_ID && device.deviceDescriptor.idProduct === SCANNER_PRODUCT_ID) {
    mainWindow?.webContents.send("usb-change-device", true);
  }
});
usb.on("detach", (device) => {
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
    try {
      const dir = `${homeDirectory}/recyclePictures/${arg}`;
      if (!fs$4.existsSync(dir)) {
        fs$4.mkdirSync(dir);
      }
    } catch (err) {
      log.error(err, "err");
    }
  });
  electron.ipcMain.on("change-auto", (event, arg) => {
    db.update("isAuto", () => arg).write();
    event.reply("change-auto-response", arg);
  });
  electron.ipcMain.on("local-picture-save", (event, arg) => {
    moveFiles(
      filePath,
      targetDir,
      () => {
        saveLocalPicture(arg, db, event);
      },
      db
    );
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
