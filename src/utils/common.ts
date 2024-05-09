import fs from 'fs'
import axios from 'axios'
import FormData from 'form-data'
import os from 'os'
import usb from 'usb'
import uuid from 'node-uuid'
import pino from 'pino'
import removeFileDir from '../utils/removeDir'
import getFiles from '../utils/getFiles'
import moment from 'moment'

const SCANNER_VENDOR_ID = 1208
const SCANNER_PRODUCT_ID = 359

const logger = pino()
// 获取用户目录
const homeDirectory = os.homedir()
/** 需要监听的文件路径 */
const filePath = `${homeDirectory}/recyclePictures` // 文件路径

const createDir = (filePath) => {
  if (!fs.existsSync(filePath)) {
    fs.mkdirSync(filePath)
    console.log('create dir success')
  } else {
    console.log('dir already exists')
  }
}

const initDb = () => {
  // db.get('recycleInfos').remove().write()
}

const checkScannerStatus = (cb) => {
  const devices = usb.getDeviceList()
  const scannerConnected = devices.some(
    (device) =>
      device.deviceDescriptor.idVendor === SCANNER_VENDOR_ID &&
      device.deviceDescriptor.idProduct === SCANNER_PRODUCT_ID
  )

  if (scannerConnected) {
    console.log('Scanner is connected.')
    // 可以进一步将状态发送到渲染器
    cb && cb(true)
  } else {
    console.log('Scanner is not connected.')
    // mainWindow?.webContents.send('usb-change-device', false)
    cb && cb(false)
  }
}

const checkRestFiles = (cb) => {
  fs.readdir(filePath, { withFileTypes: true }, (err, files) => {
    if (err) {
      console.log('Error reading directory:', err)
      return
    }
    // 过滤出所有的文件夹
    const folders = files.filter((file) => file.isDirectory()).map((folder) => folder.name)

    folders?.forEach((one) => {
      if (getFiles(`${filePath}/${one}`)?.length) {
        cb && cb(`${filePath}/${one}`)
      }
    })
    console.log(folders)
  })
}

const savePicture = (arg, db, event) => {
  event?.reply('picture-save-response', 'loading')
  const files = getFiles(arg)
  const data = new FormData()
  // const splits = arg?.split('/')
  // const time = splits?.[splits?.length - 1]
  const infos: any = []
  files?.forEach((one) => {
    data.append('files', fs.createReadStream(one))
    infos.push({
      filePath: one,
      createTime: moment().format('YYYY-MM-DD HH:mm:ss'),
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
      event?.reply('picture-save-response', response.data)
      /** 更改数据库数据 */
      db.get('recycleInfos')
        .filter({ parentPath: arg })
        .each((one) => {
          one.isUpload = true
          one.updateTime = moment().format('YYYY-MM-DD HH:mm:ss')
        })
        .write()
      /** 删除文件 */
      removeFileDir(arg)
    })
    .catch((error) => {
      logger.info(error)
      event?.reply('picture-save-response', error?.data)
    })
}

export { createDir, initDb, checkScannerStatus, savePicture, checkRestFiles }
