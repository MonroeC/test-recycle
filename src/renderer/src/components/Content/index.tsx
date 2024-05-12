import { Button, Flex, message } from 'antd'
import { CloseCircleFilled, CheckCircleFilled } from '@ant-design/icons'
import ConfirmRecycle from '../ConfirmReccycle'
import ResultModal from '../ResultModal'
import scanAndSaveButtonClick from '../../../../utils/scanAndSaveButtonClick'
import './index.css'
import { useEffect, useRef, useState } from 'react'

const Content = ({
  networkStatus,
  epsonConnect,
  filePath,
  isAuto
}: {
  /**
   * 当前网络状态
   */
  networkStatus: string
  epsonConnect: boolean
  filePath: string
  /**
   * 自动回收状态
   */
  isAuto
}) => {
  const [saveVisible, setSaveVisible] = useState(false)
  const [status, setStatus] = useState('')
  const confirmRef = useRef<any>(null)

  const autoFun = () => {
    scanAndSaveButtonClick(
      // @ts-ignore
      ESLFunctions,
      filePath,
      (errCode, msg) => {
        // @ts-ignore
        if (window.isAuto) {
          console.log(errCode, msg)
          if (errCode !== 40008002) {
            message.error(msg ?? '扫描仪启动失败')
          }
        }
      },
      () => {
        if ((window as any).isAuto) {
          autoFun()
        }
      }
    )
  }
  useEffect(() => {
    // ts-ignore
    ;(window as any).isAuto = isAuto
    if (isAuto && epsonConnect) {
      autoFun()
    }
  }, [isAuto, epsonConnect])

  useEffect(() => {
    window.electron.ipcRenderer.on('picture-save-response', (_event, arg) => {
      if (!(window as any).isAuto) {
        if (arg === 'loading') {
          setStatus('loading')
        } else {
          confirmRef.current?.setLoading(false)
          setSaveVisible(true)
          if (arg === 'success') {
            setStatus('success')
          } else {
            message.error(arg.errMeaasge ?? '单据上传失败')
            setStatus('error')
          }
        }
      }
    })
  }, [])

  return (
    <Flex vertical className="content">
      <Flex justify="center" align="center" vertical gap={50}>
        <Flex vertical gap={20}>
          <div className="tips">1、将单据分为单张、整洁、摆正投入回收口</div>
          <Flex className="img-content" justify="space-between">
            <Flex vertical gap={12} style={{ width: 304 }} justify="center" align="center">
              <img alt="" className="tips-img" src="https://placehold.co/600x400" />
              <div>单据歪斜、折边、黏连</div>
              <CloseCircleFilled className="icon color-red" />
            </Flex>
            <Flex vertical gap={12} style={{ width: 304 }} justify="center" align="center">
              <img alt="" className="tips-img" src="https://placehold.co/600x400" />
              <div>别针、图钉、露胶等</div>
              <CloseCircleFilled className="icon color-red" />
            </Flex>
            <Flex vertical gap={12} style={{ width: 304 }} justify="center" align="center">
              <img alt="" className="tips-img" src="https://placehold.co/600x400" />
              <div>单据规正，无折边，无黏连、无硬物、黏胶</div>
              <CheckCircleFilled className="icon color-green" />
            </Flex>
          </Flex>
        </Flex>
        <Flex vertical gap={20} align="center">
          <div className="tips">2、再点击确认回收</div>
          {networkStatus === 'offline' || !epsonConnect || isAuto ? (
            <Button className="confirm-btn-disabled" disabled>
              确认回收
            </Button>
          ) : (
            <ConfirmRecycle ref={confirmRef} filePath={filePath} />
          )}
        </Flex>
      </Flex>
      <ResultModal
        visible={saveVisible}
        onCancel={() => {
          setSaveVisible(false)
        }}
        status={status}
      />
    </Flex>
  )
}

export default Content
