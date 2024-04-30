import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import fs from 'fs'
import os from 'os'
import si from 'systeminformation'
import { Low } from 'lowdb'
import { JSONFile } from 'lowdb/node'
import icon from '../../resources/icon.png?asset'
import getFileCount from '../utils/getFileCount'
import usb from 'usb'

// 获取用户目录
const homeDirectory = os.homedir()
/** 需要监听的文件路径 */
const filePath = `${homeDirectory}/recyclePictures` // 文件路径
console.log(filePath, 'filePath')
if (!fs.existsSync(filePath)) {
  fs.mkdirSync(filePath)
  console.log('create dir success')
} else {
  console.log('dir already exists')
}
// const db = new Low(new JSONFile('file.json'), {})
// const adapter = new JSONFileSync(`${homeDirectory}/db.json`) // 申明一个适配器
// const db = new Low(adapter, { pictures: [] })
// await db.read() //读取文件必须存在，否则content为null无法获取到的文件中的数据
// const content = null === db.data ? {} : db.data
// console.log(content, 'content')

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    },
    fullscreen: true
  })

  /** 打开开发者工具 */
  mainWindow.webContents.openDevTools()
  /**
   * 监听usbs设备插拔
   */
  usb.on('attach', (device) => {
    console.log('attcah device', device)
    mainWindow?.webContents.send('usb-change-device', device)
  })

  usb.on('detach', (device) => {
    console.log('detach device', device)
    mainWindow?.webContents.send('usb-change-device', device)
  })

  /**
   * 监听未上传文件个数
   */
  fs.watchFile(filePath, () => {
    // 获取文件个数
    const fileCount = getFileCount(filePath)
    // 将文件个数发送给渲染进程
    mainWindow?.webContents.send('file-count-changed', fileCount)
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
    const fileCount = getFileCount(filePath)
    // 将文件个数发送给渲染进程
    mainWindow?.webContents.send('file-count-changed', fileCount)
    /**
     * 将文件路径发送给渲染进程
     */
    mainWindow?.webContents.send('recycle-pictures-filePath', filePath)

    /**
     * 获取系统信息
     */
    si.system().then((data) => {
      mainWindow?.webContents.send('system-info', data)
    })
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  // 监听来自渲染进程的事件: 单据回收
  ipcMain.on('create-pictures-dir', (_event, arg) => {
    console.error(arg, 'arg')
    // 创建图片文件夹
    const dir = `${homeDirectory}/recyclePictures/${arg}`
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir)
    }
  })

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
