import React from 'react'
import { Button, Flex, message } from 'antd'
import { CloseCircleFilled, CheckCircleFilled } from '@ant-design/icons'
import fs from 'fs'
import path from 'path'
import './index.css'

const Content = ({
  networkStatus
}: {
  /**
   * 当前网络状态
   */
  networkStatus: string
}) => {
  /**
   * 回收单据
   */
  const handleRecycle = (): void => {
    console.log(path, 121)

    message.success('操作成功')

    window.electron.ipcRenderer.send('create-pictures-dir', '123')
  }

  return (
    <Flex vertical className="content">
      <Flex justify="center" align="center" vertical gap={50}>
        <Flex vertical gap={20}>
          <div className="tips">1、1先将单据分为单张、整洁、摆正投入回收口</div>
          <Flex className="img-content" justify="space-between">
            <Flex vertical gap={12} justify="center" align="center">
              <img alt="" className="tips-img" src="https://placehold.co/600x400" />
              <div>单据歪斜、折边、黏连</div>
              <CloseCircleFilled className="icon color-red" />
            </Flex>
            <Flex vertical gap={12} justify="center" align="center">
              <img alt="" className="tips-img" src="https://placehold.co/600x400" />
              <div>单据歪斜、折边、黏连</div>
              <CloseCircleFilled className="icon color-red" />
            </Flex>
            <Flex vertical gap={12} justify="center" align="center">
              <img alt="" className="tips-img" src="https://placehold.co/600x400" />
              <div>单据歪斜、折边、黏连</div>
              <CheckCircleFilled className="icon color-green" />
            </Flex>
          </Flex>
        </Flex>
        <Flex vertical gap={20} align="center">
          <div className="tips">2、再点击确认回收</div>
          {networkStatus === 'offline' ? (
            <Button className="confirm-btn-disabled" disabled>
              确认回收
            </Button>
          ) : (
            <Button className="confirm-btn" onClick={handleRecycle} id="recycle-btn">
              确认回收
            </Button>
          )}
        </Flex>
      </Flex>
    </Flex>
  )
}

export default Content
