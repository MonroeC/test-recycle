export {}
declare global {
  interface Window {
    /**
     * 是否连续扫码
     */
    isAuto: boolean
    /**
     * 是否连续扫码中
     */
    isAutoScanning: boolean
    /**
     * 连续扫描失败次数
     */
    errorCount: number
    /**
     * 扫描仪是否打开
     */
    scanOpen: boolean
    /**
     * 扫描仪实例对象
     */
    eslObj: any
  }
}
