import { Flex, Space, Button, Modal } from 'antd'
import { useEffect, useState } from 'react'
import SettingModal from '../SettingModal'
import logo from '../../../../../resources/logo.png'
import icOffline from '../../../../../resources/images/ic_offline.png'
import icOnline from '../../../../../resources/images/ic_online.png';
import syncAuto from '../../../../../resources/images/syncAuto.png';
import syncAutoBlack from '../../../../../resources/images/syncAuto-black.png';
import upload from '../../../../../resources/images/upload.png';
import offline from '../../../../../resources/images/offline.png';
import online from '../../../../../resources/images/online.png';
import './index.css'

const Header = ({
  networkStatus,
  epsonConnect,
  isAuto
}: {
  /**
   * 当前网络状态
   */
  networkStatus: string
  /**
   * 扫描仪链接状态
   */
  epsonConnect
  /**
   * 自动回收状态
   */
  isAuto
}) => {
  const [failedCount, setFileCount] = useState(0)
  const [systemInfo, setSystemInfo] = useState<Record<string, string>>()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    window.electron.ipcRenderer.on('file-count-changed', (_event, arg) => {
      setFileCount(arg)
    })
    window.electron.ipcRenderer.on('system-info', (_event, arg) => {
      setSystemInfo(arg)
    })
  }, [])

  const handleSetting = () => {
    setVisible(true)
  }

  const exitApp = () => {
    window.electron.ipcRenderer.send('exit-app')
  }

  const handleExit = () => {
    if (failedCount > 0) {
      Modal.confirm({
        title: '您有尚未上传完毕的扫描照片，是否确定退出程序?',
        onOk: exitApp,
        okText:'确认',
        cancelText: '取消'
      })
    } else {
      exitApp()
    }
  }

  return (
    <Flex justify="space-between" className="header">
      <Space>
        <div onClick={handleSetting} className="color-white g-fs-14">
          <img className='logo-img' src={logo} />
        </div>
        <div className="title">基石单据回收客户端</div>
      </Space>
      <Space size={16}>
        <Button danger variant='outlined' ghost size='small' onClick={handleExit}>点击退出</Button>
        <div>
          <Space size={4} direction="vertical" className="header-space">
            <img className="header-space-img auto-icon" src={epsonConnect && isAuto ? syncAuto : syncAutoBlack} />
            <div className="color-white g-fs-12 des-title" style={{ top: -8 }}>自动回收</div>
          </Space>
        </div>
        <div>
          <Space size={0} direction="vertical" className="header-space">
            <img className="header-space-img" src={epsonConnect ? icOnline : icOffline} />
            <div className="color-white g-fs-12 des-title">扫描仪</div>
          </Space>
        </div>
        <div>
          <Space size={4} direction="vertical" className="header-space">
            <img className="header-space-img  upload-icon" src={upload} />
            <div className="color-white g-fs-12 des-title-upload">{failedCount}</div>
          </Space>
        </div>
        <div>
          <Space size={4} direction="vertical" className="header-space">
            <img
              className="header-space-img upload-wife"
              src={
                networkStatus ? online : offline
              }
            />
            <div className="color-white g-fs-12 des-title">网络</div>
          </Space>
        </div>
      </Space>
      <SettingModal
        visible={visible}
        uuid={systemInfo?.uuid}
        checked={isAuto}
        onCancel={() => {
          setVisible(false)
        }}
      />
    </Flex>
  )
}

export default Header
