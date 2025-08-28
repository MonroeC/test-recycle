import { Button, Space } from 'antd'
import { useState, useEffect } from 'react'
import scanOpen from '../../../../utils/scanOpen'
import scan from '../../../../utils/scan'
import ScanResultLoading from './ScanResultLoading'
import {getDb} from '../../../../utils/dbFun'
import './index.css'

const AutoConfirmRecycle = ({
  filePath,
  setScanResultLoading,
  scanResultLoading,
  setIsAuto
}: {
  filePath: string
  setScanResultLoading: (v: boolean) => void
  scanResultLoading: boolean
  setIsAuto: (v: boolean) => void
}) => {
  const [loading, setLoading] = useState(false)
  const [autoErrCode, setAutoErrCode] = useState()
  const [flag, setFlag] = useState(false)
  const [direction, setDirection] = useState<any>('row')

  useEffect(() => {
    window.electron.ipcRenderer.on('change-picture-direction-response', (_event, data) => {
      setDirection(data)
    })
  }, [])
  useEffect(()=> {
    getDb('pictureDirection').then(res => {
      setDirection(res)
    })
  }, [])


  const saveSuccessCallback = () => {
    window.errorCount = 0
    setScanResultLoading(true)
    setFlag(false)
    console.log(filePath, 'filePath')
    window.electronApi.saveLocalPicture(filePath)
  }

  const scanAllSuccessCallback = () => {
    autoFun()
  }

  const scanErrorCallback = (errCode) => {
    window.errorCount = window.errorCount + 1
    if (window.errorCount > 10) {
      setLoading(false)
      setAutoErrCode(errCode)
      window.errorCount = 0
      window.isAutoScanning = false
    }
    autoFun()
  }

  const [isExistPicture, setIsExistPicture] = useState(false)
  const saveOneSuccessCallback = (result) => {
    console.log(result, 'oneresult')
    setIsExistPicture(true)
  }
  const autoFun = () => {
    scan({
      filePath,
      saveSuccessCallback,
      scanErrorCallback,
      scanAllSuccessCallback,
      saveOneSuccessCallback,
      isDocRotate: direction === 'col'
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
    if (window.isAutoScanning) {
      setFlag(true)
    }
    window.isAutoScanning = false
  }
  return (
    <Space size={50}>
      <Button
        className={!loading && !flag ? 'confirm-btn' : 'confirm-btn-disabled'}
        onClick={handleScan}
        disabled={loading || flag}
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
      <ScanResultLoading
        autoErrCode={autoErrCode}
        visible={scanResultLoading}
        isExistPicture={isExistPicture}
        onCancel={() => {
          window.isAuto = false
          setIsAuto(false)
          setScanResultLoading(false)
          setIsExistPicture(false)
        }}
      />
    </Space>
  )
}

export default AutoConfirmRecycle
