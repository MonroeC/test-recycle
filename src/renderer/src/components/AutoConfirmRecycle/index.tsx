import { Button, Space } from 'antd'
import { useState } from 'react'
import scanOpen from '../../../../utils/scanOpen'
import scan from '../../../../utils/scan'
import ScanResultLoading from './ScanResultLoading'
import './index.css'

const AutoConfirmRecycle = ({
  filePath,
  setScanResultLoading,
  scanResultLoading
}: {
  filePath: string
  setScanResultLoading: (v: boolean) => void
  scanResultLoading: boolean
}) => {
  const [loading, setLoading] = useState(false)

  const saveSuccessCallback = () => {
    window.errorCount = 0
    setScanResultLoading(true)
    window.electronApi.saveLocalPicture(filePath)
  }

  const scanAllSuccessCallback = () => {
    autoFun()
  }

  const scanErrorCallback = () => {
    window.errorCount = window.errorCount + 1
    if (window.errorCount > 10) {
      setLoading(false)
      window.errorCount = 0
      window.isAutoScanning = false
    }
    autoFun()
  }
  const autoFun = () => {
    scan({
      filePath,
      saveSuccessCallback,
      scanErrorCallback,
      scanAllSuccessCallback
    })
  }

  const openSuccessCallback = () => {
    autoFun()
  }

  /**
   * 回收单据
   */
  const handleScan = (): void => {
    setLoading(true)
    window.isAutoScanning = true
    scanOpen({
      successCallBack: openSuccessCallback,
      errorCallback: () => {}
    })
  }

  /**
   * 停止扫描
   */
  const handleStopScan = () => {
    setLoading(false)
    window.isAutoScanning = false
  }

  return (
    <Space size={50}>
      <Button
        className={!loading ? 'confirm-btn' : 'confirm-btn-disabled'}
        onClick={handleScan}
        disabled={loading}
        id="recycle-btn"
      >
        开始扫描
      </Button>
      <Button
        className={loading ? 'confirm-btn' : 'confirm-btn-disabled'}
        disabled={!loading}
        id="recycle-btn-disabled"
        onClick={handleStopScan}
      >
        扫描完成
      </Button>
      <ScanResultLoading visible={scanResultLoading} onCancel={() => setScanResultLoading(false)} />
    </Space>
  )
}

export default AutoConfirmRecycle
