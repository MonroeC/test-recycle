import { Button } from 'antd'
import { useState, forwardRef, useImperativeHandle } from 'react'
import scanAndSaveButtonClick from '../../../../utils/scanAndSaveButtonClick'
import ResultModal from '../ResultModal'
import './index.css'

const ConfirmRecycle = ({ filePath }, ref) => {
  const [loading, setLoading] = useState(false)
  const [visible, setVisible] = useState(false)
  const [subTitle, setSubTitle] = useState('')

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
    scanAndSaveButtonClick(ESLFunctions, filePath, (msg) => {
      setLoading(false)
      setVisible(true)
      setSubTitle(msg)
    })
  }

  return (
    <>
      <Button className="confirm-btn" onClick={handleRecycle} id="recycle-btn" loading={loading}>
        确认回收
      </Button>
      <ResultModal
        visible={visible}
        status="scanError"
        onCancel={() => setVisible(false)}
        subTitle={subTitle}
      />
    </>
  )
}

export default forwardRef(ConfirmRecycle)
