import { Button } from 'antd'
import { useState, forwardRef, useImperativeHandle } from 'react'
import scanAndSaveButtonClick from '../../../../utils/scanAndSaveButtonClick'
import ResultModal from '../ResultModal'
import './index.css'

const ConfirmRecycle = (
  {
    filePath,
    epsonConnect
  }: {
    filePath: string
    epsonConnect: boolean
  },
  ref
) => {
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
    scanAndSaveButtonClick(ESLFunctions, filePath, (errCode, msg) => {
      setLoading(false)
      console.log(errCode, 'errrorCode')
      setVisible(true)
      setSubTitle(
        errCode != 40008002
          ? '请联系项目人员检查设备是否异常？或扫描仪是否卡纸或污损？'
          : '未检测到扫描单据，请检查'
      )
    })
  }

  const disabled = !epsonConnect
  return (
    <>
      <Button
        className={disabled ? 'confirm-btn-disabled' : 'confirm-btn'}
        disabled={disabled}
        onClick={handleRecycle}
        id="recycle-btn"
        loading={loading}
      >
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
