export default ({ cb }) => {
  window.eslObj = ESLFunctions.ESLCreate()
  /**
   * 目标扫描仪参数
   */
  const connectionParam: any = {}
  /** 扫描仪名称 */
  connectionParam.deviceName = 'DS-535'
  /** 连接类型 */
  connectionParam.connectType = 1
  window.eslObj.Open(connectionParam, function (isSuccess, result) {
    if (isSuccess == true) {
      cb(true)
    } else {
      window.scanOpen = false
      cb(false)
    }
  })
}
