import { Button, message } from 'antd'
import { useEffect, useRef, memo } from 'react'
import getFiles from '../../../../utils/getFiles'
import convertImageToBinary from '../../../../utils/convertImageToBinary'
import scanAndSaveButtonClick from '../../../../utils/scanAndSaveButtonClick'
import './index.css'

const ConfirmRecycle = ({ filePath }) => {
  /**
   * 回收单据
   */
  const handleRecycle = (): void => {
    scanAndSaveButtonClick(ESLFunctions, filePath)
  }

  useEffect(() => {
    window.electron.ipcRenderer.on('picture-save-response', (_event, arg) => {
      if (arg.success) {
        message.success('单据回收成功')
      } else {
        message.error(arg.errMeaasge ?? '单据上传失败')
      }
    })
  }, [])

  return (
    <Button className="confirm-btn" onClick={handleRecycle} id="recycle-btn">
      确认回收
    </Button>
  )
}

export default memo(ConfirmRecycle)
