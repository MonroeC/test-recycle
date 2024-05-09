import { useEffect, useState } from 'react'
import { Flex, Modal, Tabs } from 'antd'
import { useCountDown } from 'ahooks'
import Sn from './Sn'
import Other from './Other'
import './index.css'

interface IProps {
  visible: boolean
  onCancel?: () => void
  onOk?: () => void
  checked: boolean
  [key: string]: any
}
const SettingModal = (props: IProps) => {
  const { visible, onOk, onCancel, uuid, checked } = props
  const [activeKey, setActiveKey] = useState('sn')

  const [targetDate, setTargetDate] = useState<number>()

  const [countdown] = useCountDown({
    targetDate,
    onEnd: () => {
      onCancel && onCancel()
    }
  })

  useEffect(() => {
    if (visible) {
      setTargetDate(Date.now() + 10000)
    } else {
      setActiveKey('sn')
    }
  }, [visible])

  const handleOk = () => {
    onOk && onOk()
  }

  const handleCancel = () => {
    onCancel && onCancel()
  }

  const items = [
    {
      key: 'sn',
      label: '机器SN码'
    },
    {
      key: 'other',
      label: '其他设置'
    }
  ]

  return (
    <Modal
      open={visible}
      onOk={handleOk}
      onCancel={handleCancel}
      maskClosable={false}
      destroyOnClose={true}
      centered={true}
      width={700}
      title={''}
      footer={null}
      className="setting-modal"
      styles={{
        body: {
          minHeight: 400,
          padding: 0
        }
      }}
    >
      <Flex vertical={true} justify="space-between">
        <div style={{ flex: 1 }}>
          <Tabs items={items} type="card" activeKey={activeKey} onChange={setActiveKey} />
          <div style={{ height: 320 }}>
            {activeKey === 'sn' && <Sn uuid={uuid} />}
            {activeKey === 'other' && <Other checked={checked} />}
          </div>
        </div>
        <div className={'tip'}>倒计时{Math.round(countdown / 1000)}s后关闭</div>
      </Flex>
    </Modal>
  )
}

export default SettingModal
