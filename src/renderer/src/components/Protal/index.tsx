import Header from '../Header'
import Content from '../Content'
import { useState, useEffect } from 'react'
import useFilePath from '@renderer/hooks/useFilePath'
import scanClose from '../../../../utils/close'
import scanOpen from '../../../../utils/scanOpen'
import scan from '../../../../utils/scan'
import { message } from 'antd'
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

  /**
   * 新增加在window上的变量
   * window.scanOpen 扫描进程是否开启
   * window.isAuto 是否是自动模式
   * window.errorCount 错误次数
   * window.isAutoScanning 是否正在自动扫描中
   */

  useEffect(() => {
    window.isAuto = isAuto
    window.electronApi.changeAuto(isAuto)

    if (!isAuto) {
      return
    }
    window.errorCount = 0
  }, [isAuto])
  useEffect(() => {
    return () => {
      // 卸 载的时候关闭扫描进程
      // 'http://localhost:51000'
      scanClose(() => {})
    }
  }, [])
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
