import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import fs from 'fs'
import os from 'os'
import si from 'systeminformation'
import icon from '../../resources/icon.png?asset'
import usb from 'usb'
import low from 'lowdb'
import FileSync from 'lowdb/adapters/FileSync'
import pino from 'pino'
import moveFiles from '../utils/moveFiles'
import {
  createDir,
  savePicture,
  saveLocalPicture,
  checkScannerStatus,
  checkRestFiles
} from '../utils/common'
import getFileCount from '../utils/getFileCount'

const logger = pino()
const log = require('electron-log')
// 获取用户目录
const homeDirectory = os.homedir()
/** 需要监听的文件路径 */
// const filePath = `${homeDirectory}/recyclePictures` // 文件路径

// 设置源文件夹和目标文件夹路径
const filePath = join(homeDirectory, 'recycle-pictures-A')
const targetDir = join(homeDirectory, 'recycle-pictures-B')

/** 创建照片存储文件夹： 根目录下的recyclePictures */
createDir(filePath)
createDir(targetDir)
/** 初始化数据库 */
const adapter = new FileSync(`${homeDirectory}/db.json`) // 指定数据文件
const db = low(adapter)
db.defaults({ recycleInfos: [], isAuto: false }).write()
db.get('recycleInfos').remove().write()

const SCANNER_VENDOR_ID = 1208
const SCANNER_PRODUCT_ID = 359
const INTERVAL_TIME = 5000

let mainWindow

function createWindow(): void {
  // Create the browser window.
  mainWindow = new BrowserWindow({
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

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
    checkScannerStatus((value) => {
      mainWindow?.webContents.send('usb-change-device', value)
    })

    checkInterval()
    // 将文件个数发送给渲染进程
    const fileCount = getFileCount(targetDir)
    console.log(fileCount, 'filecount')
    mainWindow?.webContents.send('file-count-changed', fileCount)
    /**
     * 将文件路径发送给渲染进程
     */
    mainWindow?.webContents.send('recycle-pictures-filePath', filePath)
    /**
     * 是否自动回收
     */
    // mainWindow?.webContents.send('change-auto-response', db.get('isAuto').value())

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

const checkInterval = () => {
  setInterval(() => {
    checkRestFiles((value) => savePicture(value, db), db)
  }, INTERVAL_TIME)
}

/**
 * 监听未上传文件个数
 */
fs.watch(targetDir, () => {
  // 获取文件个数
  const fileCount = getFileCount(targetDir)
  // 将文件个数发送给渲染进程
  mainWindow?.webContents.send('file-count-changed', fileCount)
})

/**
 * 监听usbs设备插拔
 */
usb.on('attach', (device) => {
  console.log('attached:')
  if (
    device.deviceDescriptor.idVendor === SCANNER_VENDOR_ID &&
    device.deviceDescriptor.idProduct === SCANNER_PRODUCT_ID
  ) {
    console.log('Scanner attached:')
    mainWindow?.webContents.send('usb-change-device', true)
  }
})

usb.on('detach', (device) => {
  console.log('detach:')
  if (
    device.deviceDescriptor.idVendor === SCANNER_VENDOR_ID &&
    device.deviceDescriptor.idProduct === SCANNER_PRODUCT_ID
  ) {
    mainWindow?.webContents.send('usb-change-device', false)
  }
})

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
  ipcMain.on('ping', () => logger.info('pong'))

  /**
   * 监听来自渲染进程的事件: 单据回收
   */
  ipcMain.on('create-pictures-dir', (_event, arg) => {
    try {
      // 创建图片文件夹
      const dir = `${homeDirectory}/recyclePictures/${arg}`
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir)
      }
    } catch (err) {
      log.error(err, 'err')
    }
  })
  /**
   * 监听自动扫描开关配置
   */
  ipcMain.on('change-auto', (event, arg) => {
    db.update('isAuto', () => arg).write()
    event.reply('change-auto-response', arg)
  })

  ipcMain.on('local-picture-save', (event, arg) => {
    // saveLocalPicture(arg, db, event)
    moveFiles(
      filePath,
      targetDir,
      () => {
        saveLocalPicture(arg, db, event)
      },
      db
    )
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
  // @ts-ignore
  clearInterval(checkInterval)
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
