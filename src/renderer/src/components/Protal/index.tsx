import Header from '../Header'
import Content from '../Content'
import { useState, useRef, useEffect } from 'react'
import useFilePath from '@renderer/hooks/useFilePath'
const Portal = () => {
  /**
   * 网络链接状态
   */
  const [networkStatus, setNetworkStatus] = useState(navigator.onLine ? 'online' : 'offline')
  /**
   * 连接epson打印机状态
   */
  const [epsonConnect, setEpsonConnect] = useState(false)
  /**
   * usb 变化监听
   */
  const [usbChangeCount, setUsbChangeCount] = useState(0)
  /**
   * 图片存储文件夹目录
   */
  // const [filePath, setFilePath] = useState()
  const { filePath } = useFilePath()
  console.log(filePath, 'filePath')
  const refreshUsbChangeCount = () => {
    setUsbChangeCount((old) => old + 1)
  }

  useEffect(() => {
    window.electron.ipcRenderer.on('usb-change-device', () => {
      refreshUsbChangeCount()
    })
  }, [])

  const eslObjRef = useRef(null)

  const alertOnlineStatus = () => {
    setNetworkStatus(navigator.onLine ? 'online' : 'offline')
  }

  window.addEventListener('online', alertOnlineStatus)
  window.addEventListener('offline', alertOnlineStatus)

  useEffect(() => {
    // @ts-ignore
    if (!ESLFunctions) return
    // @ts-ignore
    eslObjRef.current = ESLFunctions.ESLCreate()
    // @ts-ignore
  }, [ESLFunctions])

  const GetInfoFromScannerClick = () => {
    const connectionParam: any = {}
    connectionParam.deviceName = 'DS-535'
    connectionParam.connectType = 0

    const eslObj = eslObjRef?.current
    if (!eslObj) return
    eslObj?.Open(connectionParam, function (_isSuccess, result) {
      if (result?.errorCode === 0) {
        setEpsonConnect(true)
      } else {
        setEpsonConnect(false)
      }
    })
  }

  useEffect(() => {
    if (!eslObjRef.current) return
    GetInfoFromScannerClick()
  }, [eslObjRef.current, usbChangeCount])

  return (
    <>
      <Header networkStatus={networkStatus} epsonConnect={epsonConnect} />
      <Content networkStatus={networkStatus} epsonConnect={epsonConnect} filePath={filePath} />
    </>
  )
}
export default Portal
