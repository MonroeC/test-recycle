import { Flex, Space } from 'antd'
import React, { useEffect, useState } from 'react'
import { WifiOutlined, CloudUploadOutlined, ScanOutlined } from '@ant-design/icons'
import getFileCount from '../../../../utils/getFileCount'
// import checkNetworkStatus from '../../../utils/checkNetworkStatus';
import './index.css'

const Header = ({
  networkStatus
}: {
  /**
   * 当前网络状态
   */
  networkStatus: string
}) => {
  const [failedCount, setFileCount] = useState(0)
  window.electron.ipcRenderer.on('file-count-changed', (event, arg) => {
    console.log(arg, 'arg')
    setFileCount(arg)
  })
  return (
    <Flex justify="space-between" className="header">
      <Space>
        <div className="title">基石单据回收客户端</div>
      </Space>
      <Space>
        <div>
          <Space size={4} direction="vertical" className="header-space">
            <ScanOutlined className="header-space-img" />
            <div className="color-white g-fs-12">扫描仪</div>
          </Space>
        </div>
        <div>
          <Space size={4} direction="vertical" className="header-space">
            <CloudUploadOutlined className="header-space-img" />
            <div className="color-white g-fs-12">{failedCount}</div>
          </Space>
        </div>
        <div>
          <Space size={4} direction="vertical" className="header-space">
            <WifiOutlined
              className="header-space-img"
              style={{
                color: networkStatus === 'online' ? '#61f661' : '#d5dbd5'
              }}
            />
            <div className="color-white g-fs-12">网络</div>
          </Space>
        </div>
      </Space>
    </Flex>
  )
}

export default Header
