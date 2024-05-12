"use strict";
const electron = require("electron");
const preload = require("@electron-toolkit/preload");
const api = {};
console.log(preload.electronAPI, "electronAPI");
if (process.contextIsolated) {
  try {
    electron.contextBridge.exposeInMainWorld("electron", preload.electronAPI);
    electron.contextBridge.exposeInMainWorld("electronApi", {
      createPicturesDir: (dir) => electron.ipcRenderer.send("create-pictures-dir", dir),
      pictureSave: (dir) => electron.ipcRenderer.send("picture-save", dir),
      changeAuto: (isAuto) => electron.ipcRenderer.send("change-auto", isAuto),
      saveLocalPicture: (dir) => electron.ipcRenderer.send("local-picture-save", dir)
    });
  } catch (error) {
    console.error(error);
  }
} else {
  window.electron = preload.electronAPI;
  window.api = api;
}
