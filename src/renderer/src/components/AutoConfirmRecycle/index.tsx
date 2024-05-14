import { Button, Space } from 'antd'
import { useState, forwardRef, useImperativeHandle, useEffect } from 'react'
import scanClose from '../../../../utils/close'
import scanOpen from '../../../../utils/scanOpen'
import scan from '../../../../utils/scan'
import { message } from 'antd'
import ResultModal from '../ResultModal'
import autoScanAndSaveButtonClick from '../../../../utils/autoScanAndSaveButtonClick'
import './index.css'

const AutoConfirmRecycle = ({ filePath }) => {
  const [loading, setLoading] = useState(false)
  const [visible, setVisible] = useState(false)

  const saveSuccessCallback = () => {
    window.errorCount = 0
    window.electronApi.saveLocalPicture(filePath)
  }

  const scanAllSuccessCallback = () => {
    autoFun()
  }

  const scanErrorCallback = (errCode) => {
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
    <Space>
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
        停止扫描
      </Button>
      <ResultModal visible={visible} status="scanError" onCancel={() => setVisible(false)} />
    </Space>
  )
}

export default AutoConfirmRecycle
