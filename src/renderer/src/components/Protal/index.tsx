import Header from '../Header'
import Content from '../Content'
import { useState, useEffect } from 'react'
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
   * 图片存储文件夹目录
   */
  // const [filePath, setFilePath] = useState()
  const { filePath } = useFilePath()

  const [isAuto, setIsAuto] = useState(false)
  useEffect(() => {
    window.electron.ipcRenderer.on('usb-change-device', (_event, arg) => {
      setEpsonConnect(arg)
    })
    window.electron.ipcRenderer.on('change-auto-response', (_event, data) => {
      setIsAuto(data)
    })
  }, [])

  const alertOnlineStatus = () => {
    setNetworkStatus(navigator.onLine ? 'online' : 'offline')
  }

  window.addEventListener('online', alertOnlineStatus)
  window.addEventListener('offline', alertOnlineStatus)

  return (
    <>
      <Header networkStatus={networkStatus} epsonConnect={epsonConnect} isAuto={isAuto} />
      <Content
        networkStatus={networkStatus}
        epsonConnect={epsonConnect}
        filePath={filePath}
        isAuto={isAuto}
      />
    </>
  )
}
export default Portal
