import { Button, message } from 'antd'
import { useEffect, useRef, useState } from 'react'
import './index.css'

const ConfirmRecycle = ({ filePath }) => {
  const eslObjRef = useRef(null)
  useEffect(() => {
    if (!ESLFunctions) return
    eslObjRef.current = ESLFunctions.ESLCreate()
  }, [ESLFunctions])

  console.log(filePath, 'filePath')

  /**
   * 回收单据
   */
  const handleRecycle = (): void => {
    const time = new Date().getTime()
    window.electronApi.createPicturesDir(`/${time}`)
    ScanAndSaveButtonClick(time)
  }

  function ScanAndSaveButtonClick(time) {
    const current_count = 1
    const current_fileFormat = ESLFunctions?.FF_JPEG
    /**
     * 目标扫描仪参数
     */
    const connectionParam: any = {}
    /** 扫描仪名称 */
    connectionParam.deviceName = 'DS-535'
    /** 连接类型 */
    connectionParam.connectType = 1
    /** 扫描对象 */
    const scanParams: any = {}
    /** 文档来源 */
    scanParams.docSource = ESLFunctions.SRC_FEEDER_DUPLEX
    /** 图像类型 */
    scanParams.imgType = ESLFunctions.IT_AUTO
    /** 分辨率 50 - 600 */
    scanParams.resolution = 200
    /** 文档大小 */
    scanParams.docSize = ESLFunctions.DS_AUTO
    /** 旋转方向 */
    scanParams.docRotate = ESLFunctions.DR_NONE
    /** 亮度 */
    scanParams.brightness = 0
    /** 对比度 -1000 - 1000*/
    scanParams.contrast = 0
    /** 阈值 */
    scanParams.threshold = 126
    /** 颜色过滤选项 */
    scanParams.colorFilter = ESLFunctions.CF_NONE
    /** 设置要扫描的页数。从进纸器扫描时。此配置有效， 设置为 0 将扫描进纸器上的所有文档 */
    scanParams.numScan = 0 //ALL
    /** 文档增强 */
    scanParams.docEnhance = 0
    /** 设置图像过滤器选项 */
    scanParams.imgFilter = 0
    /** 选择双馈选项 */
    scanParams.optDoubleFeedDetect = ESLFunctions.DFD_NONE
    /** 空白页跳过  BPS_NONE 不跳过*/
    scanParams.optBlankPageSkip = ESLFunctions.BPS_NONE
    /** 偏斜矫正 SC_EDGE 通过边缘矫正 */
    scanParams.skewCorrect = ESLFunctions.SC_EDGE

    /** 保存的对象 */
    const saveParam: any = {}
    /** 保存的文件格式 base64 本地文件 */
    saveParam.destination = ESLFunctions.DEST_FILE
    /** 文件格式 */
    saveParam.fileFormat = current_fileFormat
    saveParam.filePath = `${filePath}/${time}`
    saveParam.fileName = current_count
    console.log(saveParam.filePath, 'scan-filepath')

    /** 实例 */
    const eslObj = ESLFunctions.ESLCreate()
    eslObj.ScanAndSave_Simple(connectionParam, scanParams, saveParam, function (isSuccess, result) {
      if (isSuccess) {
        if (result.eventType == ESLFunctions.EVENT_SCANPAGE_COMPLETE) {
          message.info('扫描一页完成')
        }
        if (result.eventType == ESLFunctions.EVENT_ALLSCAN_COMPLETE) {
          message.info('所有扫描完成')
        }
        if (result.eventType == ESLFunctions.EVENT_SAVEPAGE_COMPLETE) {
          console.log(result, '单个保存完成')
        }
        if (result.eventType == ESLFunctions.EVENT_ALLSAVE_COMPLETE) {
          message.info('所有保存完成')
        }
      } else {
        message.error('扫描失败' + result.errorCode.toString(16))
      }
    })
  }

  return (
    <Button className="confirm-btn" onClick={handleRecycle} id="recycle-btn">
      确认回收
    </Button>
  )
}

export default ConfirmRecycle
