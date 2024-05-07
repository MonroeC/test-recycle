import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import fs from 'fs'
import os from 'os'
import si from 'systeminformation'
import icon from '../../resources/icon.png?asset'
import getFileCount from '../utils/getFileCount'
import getFiles from '../utils/getFiles'
import usb from 'usb'
import axios from 'axios'
import FormData from 'form-data'
import low from 'lowdb'
import FileSync from 'lowdb/adapters/FileSync'
import uuid from 'node-uuid'
import pino from 'pino'
import removeFileDir from '../utils/removeDir'

const logger = pino()

// 获取用户目录
const homeDirectory = os.homedir()
/** 需要监听的文件路径 */
const filePath = `${homeDirectory}/recyclePictures` // 文件路径
logger.info(filePath, 'filePath')
if (!fs.existsSync(filePath)) {
  fs.mkdirSync(filePath)
  console.log('create dir success')
} else {
  console.log('dir already exists')
}
const adapter = new FileSync(`${homeDirectory}/db.json`) // 指定数据文件
const db = low(adapter)
db.defaults({ recycleInfos: [] }).write()

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
    mainWindow?.webContents.send('usb-change-device', device)
  })

  usb.on('detach', (device) => {
    mainWindow?.webContents.send('usb-change-device', device)
  })

  /**
   * 监听未上传文件个数
   */
  fs.watch(filePath, () => {
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
  ipcMain.on('ping', () => logger.info('pong'))

  // 监听来自渲染进程的事件: 单据回收
  ipcMain.on('create-pictures-dir', (_event, arg) => {
    logger.info(arg, 'arg')
    // 创建图片文件夹
    const dir = `${homeDirectory}/recyclePictures/${arg}`
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir)
    }
  })

  ipcMain.on('picture-save', (event, arg) => {
    const files = getFiles(arg)
    const data = new FormData()
    const splits = arg?.split('/')
    const time = splits?.[splits?.length - 1]
    const infos: any = []
    files?.forEach((one) => {
      data.append('files', fs.createReadStream(one))
      infos.push({
        filePath: one,
        createTime: time,
        parentPath: arg,
        isUpload: false,
        id: uuid.v4()
      })
    })

    data.append('deviceSn', 'LBCDJSB001')
    /** 保存文件成功后将数据写入本地数据库 */
    db.get('recycleInfos')
      .push(...infos)
      .write()

    const config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: 'https://zz-test05.pinming.org/material-client-management/api/common/terminalRecycle',
      // url: 'http://172.16.15.168:8080/api/common/terminalRecycle',
      headers: {
        'content-type': 'multipart/form-data'
      },
      data: data
    }

    axios
      .request(config)
      .then((response) => {
        logger.info(JSON.stringify(response.data))
        /** 通知渲染层弹出回收反馈 */
        event.reply('picture-save-response', response.data)
        /** 更改数据库数据 */
        db.get('recycleInfos')
          .filter({ parentPath: arg })
          .each((one) => (one.isUpload = true))
          .write()
        /** 删除文件 */
        removeFileDir(arg)
      })
      .catch((error) => {
        logger.info(error)
        event.reply('picture-save-response', error?.data)
      })
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
