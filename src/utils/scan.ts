import save from './save'
function scan(params) {
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
  /** 自动连续送纸 */
  // scanParams.autoFeedingMode = ESLFunctions.AFM_ON
  /** 偏斜矫正 SC_EDGE 通过边缘矫正 */
  scanParams.skewCorrect = ESLFunctions.SC_EDGE
  scanParams.isAuto = true
  window?.eslObj?.Scan(scanParams, function (isSuccess, result) {
    if (isSuccess) {
      if (result.eventType == ESLFunctions.EVENT_SCANPAGE_COMPLETE) {
        console.log(result, 'sigele')
      }
      if (result.eventType == ESLFunctions.EVENT_ALLSCAN_COMPLETE) {
        console.log(result, 'all')
        if (!window.isAutoScanning) {
          console.log('stop')
        } else {
          params.scanAllSuccessCallback()
        }
      }
    } else {
      params.scanErrorCallback(result.errorCode)
    }
    console.log(!window.isAutoScanning, window.scanOpen, 777)
    if (!window.isAutoScanning && window.scanOpen) {
      // window.eslObj.Close((isSuccess) => {
      //   if (isSuccess) {
      //     window.scanOpen = false
      //   }
      // })
      save(params)
    }
  })
}

export default scan
