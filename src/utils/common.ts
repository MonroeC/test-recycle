import fs from 'fs'
import axios from 'axios'
import FormData from 'form-data'
import os from 'os'
import usb from 'usb'
import { join } from 'path'
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
// const filePath = join(homeDirectory, 'recycle-pictures-A')
const targetDir = join(homeDirectory, 'recycle-pictures-B')

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

const checkRestFiles = (cb, db) => {
  try {
    fs.readdir(targetDir, { withFileTypes: true }, (err, files) => {
      if (err) {
        console.log('Error reading directory:', err)
        return
      }
      // 过滤出所有的文件夹
      const folders = files.filter((file) => file.isDirectory()).map((folder) => folder.name)
      folders?.forEach((one) => {
        /**
         * 文件夹是否在上传进程中
         */
        const isNotUplaod = db
          .get('recycleInfos')
          .filter({ isUpload: 0, isDelete: false })
          .value()?.length
        if (isNotUplaod) {
          if (getFiles(`${targetDir}/${one}`)?.length) {
            cb && cb(`${targetDir}/${one}`)
          }
        }
      })
      console.log(folders)
    })
  } catch (error) {}
}

const savePicture = (arg, db) => {
  try {
    const files = getFiles(arg)
    const data = new FormData()
    files?.forEach((one) => {
      data.append('files', fs.createReadStream(one))
    })

    data.append('deviceSn', 'LBCDJSB001')
    /** 保存文件成功后将数据写入本地数据库 */

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
    files?.forEach((one) => {
      db.get('recycleInfos')
        .filter({ filePath: one })
        .each((one) => {
          one.isUpload = 1
          one.uploadingTime = moment().format('YYYY-MM-DD HH:mm:ss')
        })
        .write()
    })
    axios
      .request(config)
      .then((response) => {
        // logger.info(JSON.stringify(response.data))
        if (response?.data?.success) {
          /** 更改数据库数据 */
          db.get('recycleInfos')
            .filter({ parentPath: arg })
            .each((one) => {
              one.isUpload = 2
              one.uploadedTime = moment().format('YYYY-MM-DD HH:mm:ss')
              one.isDelete = true
            })
            .write()
          /** 删除文件 */
          removeFileDir(arg)
        } else {
          db.get('recycleInfos')
            .filter({ parentPath: arg })
            .each((one) => {
              one.isUpload = 0
              one.isDelete = false
            })
            .write()
        }
      })
      .catch((error) => {
        logger.info(error)
        db.get('recycleInfos')
          .filter({ parentPath: arg })
          .each((one) => {
            one.isUpload = 0
          })
          .write()
      })
  } catch (error) {}
}

const saveLocalPicture = (_arg, _db, event) => {
  try {
    // const files = getFiles(arg)
    // const infos: any = []
    // files?.forEach((one) => {
    //   infos.push({
    //     filePath: one,
    //     createTime: moment().format('YYYY-MM-DD HH:mm:ss'),
    //     parentPath: arg,
    //     isUpload: 0,
    //     id: uuid.v4()
    //   })
    // })

    // /** 保存文件成功后将数据写入本地数据库 */
    // db.get('recycleInfos')
    //   .push(...infos)
    //   .write()
    event?.reply('picture-save-response', 'success')
  } catch (error) {
    logger.info(error)
    event?.reply('picture-save-response', 'error')
  }
}

export { createDir, initDb, checkScannerStatus, savePicture, checkRestFiles, saveLocalPicture }
