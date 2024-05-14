export default ({ successCallBack, errorCallback }) => {
  if (!window.eslObj) {
    window.eslObj = ESLFunctions.ESLCreate()
  }

  /**
   * 目标扫描仪参数
   */
  const connectionParam: any = {}
  /** 扫描仪名称 */
  connectionParam.deviceName = 'DS-535'
  /** 连接类型 */
  connectionParam.connectType = 1
  if (!window.scanOpen) {
    window.eslObj.Open(connectionParam, function (isSuccess, result) {
      if (isSuccess == true) {
        window.scanOpen = true
        successCallBack()
      } else {
        window.scanOpen = false
        errorCallback()
      }
    })
  }
}
