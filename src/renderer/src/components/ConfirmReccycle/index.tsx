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

  return (
    <Button className="confirm-btn" onClick={handleRecycle} id="recycle-btn">
      确认回收
    </Button>
  )
}

export default memo(ConfirmRecycle)
