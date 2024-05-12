const ERR_MAP = {
  40000020: '扫描单据卡纸，请检查',
  40000021: '检测到双进给',
  40008002: '无扫描单据，请检查',
  40008003: 'ADF Conver open ',
  80000002: '扫描仪启动失败，请刷新重试',
  80000003: '缺少所需文件',
  80000005: '内存不足，无法运行',
  80000006: '没有足够的可用磁盘空间来运行',
  80000007: '无法写入磁盘',
  80000008: '无法从磁盘读取',
  80000009: '指定操作无效',
  80020001: '不支持指定型号',
  80020002: '未安装指定型号的扫描仪驱动程序',
  80020003: '无法打开扫描仪驱动程序',
  80030001: '扫描操作失败'
}

function scanAndSaveButtonClick(ESLFunctions, filePath, errcb, closecb) {
  const time = new Date().getTime()
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
  /** 自动送纸：AFM_ON  AFM_NONE */
  // scanParams.autoFeedingMode = ESLFunctions.AFM_ON
  /** 偏斜矫正 SC_EDGE 通过边缘矫正 */
  scanParams.skewCorrect = ESLFunctions.SC_EDGE

  /** 保存的对象 */
  const saveParam: any = {}
  /** 保存的文件格式 base64 本地文件 */
  saveParam.destination = ESLFunctions.DEST_FILE
  /** 文件格式 */
  saveParam.fileFormat = current_fileFormat
  saveParam.filePath = `${filePath}`
  saveParam.fileName = current_count

  /** 实例 */
  const eslObj = ESLFunctions.ESLCreate()
  eslObj.ScanAndSave_Simple(
    connectionParam,
    scanParams,
    saveParam,
    function (isSuccess, result) {
      if (isSuccess) {
        if (result.eventType == ESLFunctions.EVENT_SCANPAGE_COMPLETE) {
          window.electronApi.createPicturesDir(`/${time}`)
          console.log('扫描仪一页')
        }
        if (result.eventType == ESLFunctions.EVENT_ALLSCAN_COMPLETE) {
        }
        if (result.eventType == ESLFunctions.EVENT_SAVEPAGE_COMPLETE) {
        }
        if (result.eventType == ESLFunctions.EVENT_ALLSAVE_COMPLETE) {
          window.electronApi.saveLocalPicture(saveParam.filePath)
        }
      } else {
        errcb && errcb(result?.errorCode?.toString(16), ERR_MAP[result?.errorCode?.toString(16)])
      }
    },
    closecb
  )
}

export default scanAndSaveButtonClick
