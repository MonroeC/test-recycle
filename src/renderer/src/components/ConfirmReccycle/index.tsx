import { Button } from 'antd'
import { useState, forwardRef, useImperativeHandle } from 'react'
import scanAndSaveButtonClick from '../../../../utils/scanAndSaveButtonClick'
import './index.css'

const ConfirmRecycle = ({ filePath }, ref) => {
  const [loading, setLoading] = useState(false)

  useImperativeHandle(ref, () => {
    return {
      setLoading
    }
  })
  /**
   * 回收单据
   */
  const handleRecycle = (): void => {
    setLoading(true)
    // @ts-ignore
    scanAndSaveButtonClick(ESLFunctions, filePath)
  }

  return (
    <Button className="confirm-btn" onClick={handleRecycle} id="recycle-btn" loading={loading}>
      确认回收
    </Button>
  )
}

export default forwardRef(ConfirmRecycle)
