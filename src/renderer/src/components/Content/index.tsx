import { Flex, Space, message } from 'antd'
import { useEffect, useRef, useState } from 'react'
import { CloseCircleFilled, CheckCircleFilled } from '@ant-design/icons'
import ConfirmRecycle from '../ConfirmReccycle'
import AutoConfirmRecycle from '../AutoConfirmRecycle'
import ResultModal from '../ResultModal'
import close from '../../../../utils/close'
import pic1 from '../../../../../resources/images/pic1.png'
import pic2 from '../../../../../resources/images/pic2.png'
import pic3 from '../../../../../resources/images/pic3.png'


import './index.css'

const Content = ({
  epsonConnect,
  filePath,
  isAuto,
  setIsAuto
}: {
  epsonConnect: boolean
  filePath: string
  /**
   * 自动回收状态
   */
  isAuto
  setIsAuto
}) => {
  const [saveVisible, setSaveVisible] = useState(false)
  const [status, setStatus] = useState('')
  const confirmRef = useRef<any>(null)
  const [scanResultLoading, setScanResultLoading] = useState(false)

  const closeSuccessCallback = () => {}

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
      } else {
        close({
          closeSuccessCallback
        })
      }
    })
  }, [])

  const AUTO_TEXT_MAP = {
    first: '先将单据整理整齐、整洁、摆正，分批投入回收口',
    second: '点击“开始扫描”，扫描完毕后，点击“扫描完成”'
  }

  const TEXT_MAP = {
    first: '将单据分为单张、整洁、摆正投入回收口',
    second: '再点击“确认回收”'
  }
  const finallyTextMap = isAuto ? AUTO_TEXT_MAP : TEXT_MAP
  return (
    <Flex vertical className="content">
      <Flex justify="center" align="center" vertical gap={50}>
        <Flex vertical gap={20} style={{ width: '90%' }}>
          <div className="tips">1、{finallyTextMap.first}</div>
          <Flex className="img-content" justify="space-between">
            <Flex
              vertical
              gap={12}
              style={{ width: 'calc(30%vw)' }}
              justify="center"
              align="center"
            >
              <img alt="" className="tips-img" src={pic1} />
              <div>单据歪斜、折边、黏连</div>
              <CloseCircleFilled className="icon color-red" />
            </Flex>
            <Flex
              vertical
              gap={12}
              style={{ width: 'calc(30%vw)' }}
              justify="center"
              align="center"
            >
              <img alt="" className="tips-img" src={pic2} />
              <div>别针、图钉、露胶等</div>
              <CloseCircleFilled className="icon color-red" />
            </Flex>
            <Flex
              vertical
              gap={12}
              style={{ width: 'calc(30%vw)' }}
              justify="center"
              align="center"
            >
              <img alt="" className="tips-img" src={pic3} />
              <div>单据规正，无折边，无黏连、无硬物、黏胶</div>
              <CheckCircleFilled className="icon color-green" />
            </Flex>
          </Flex>
        </Flex>
        <Flex vertical gap={20} align="center">
          <div className="tips">2、{finallyTextMap.second}</div>
          <Space>
            {isAuto ? (
              <AutoConfirmRecycle
                setIsAuto={setIsAuto}
                filePath={filePath}
                setScanResultLoading={setScanResultLoading}
                scanResultLoading={scanResultLoading}
              />
            ) : (
              <ConfirmRecycle
                epsonConnect={epsonConnect}
                ref={confirmRef}
                filePath={filePath}
              />
            )}
          </Space>
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
