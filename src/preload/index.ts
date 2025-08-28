import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {}
console.log(electronAPI, 'electronAPI')
// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('electronApi', {
      createPicturesDir: (dir) => ipcRenderer.send('create-pictures-dir', dir),
      pictureSave: (dir) => ipcRenderer.send('picture-save', dir),
      changeAuto: (isAuto) => ipcRenderer.send('change-auto', isAuto),
      changePictureDirection: (direction) => ipcRenderer.send('change-picture-direction', direction),
      saveLocalPicture: (dir) => ipcRenderer.send('local-picture-save', dir),
      getDb: (key) => ipcRenderer.invoke('get-db', key),
    })
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
