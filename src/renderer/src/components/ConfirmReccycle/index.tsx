import { Button } from 'antd'
import { useState, forwardRef, useImperativeHandle, useEffect } from 'react'
import scanAndSaveButtonClick from '../../../../utils/scanAndSaveButtonClick'
import {getDb} from '../../../../utils/dbFun'
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
      setVisible(true)
      setSubTitle(
        errCode != 40008002
          ? '请联系项目人员检查设备是否异常？或扫描仪是否卡纸或污损？'
          : '未检测到扫描单据，请检查'
      )
    }, () => {}, direction==='col')
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
