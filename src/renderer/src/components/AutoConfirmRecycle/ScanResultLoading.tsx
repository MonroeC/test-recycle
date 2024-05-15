import { useEffect, useState } from 'react'
import { Flex, Modal, Result, Spin } from 'antd'
import { useCountDown } from 'ahooks'

interface IProps {
  visible: boolean
  onCancel?: () => void
  onOk?: () => void
  [key: string]: any
}
const ScanResultLoading = (props: IProps) => {
  const { visible, onOk, onCancel } = props
  const [targetDate, setTargetDate] = useState<number>()
  const [targetDate2, setTargetDate2] = useState<number>()

  const [loading, setLoading] = useState(true)
  useEffect(() => {
    if (visible) {
      setTargetDate(Date.now() + 2000)
    }
  }, [visible])

  const [countdown] = useCountDown({
    targetDate,
    onEnd: () => {
      setLoading(false)
      setTargetDate2(Date.now() + 3000)
    }
  })

  const [countdown2] = useCountDown({
    targetDate: targetDate2,
    onEnd: () => {
      onCancel && onCancel()
    }
  })
  const handleOk = () => {
    onOk && onOk()
  }

  const TEXT_MAP = {
    success: {
      title: '回收成功',
      subTitle: `倒计时${Math.round(countdown2 / 1000)}s后关闭`
    }
  }

  return (
    <Modal open={visible} onOk={handleOk} maskClosable={false} width={400} footer={null} centered>
      {loading ? (
        <Flex gap={20} vertical={true} justify="center" align="center">
          <Spin style={{ fontSize: 40 }} spinning={true}></Spin>
          <h2>扫描结果处理中</h2>
        </Flex>
      ) : (
        <Result
          status={'success'}
          title={TEXT_MAP.success?.title}
          subTitle={TEXT_MAP.success?.subTitle}
        />
      )}
    </Modal>
  )
}
export default ScanResultLoading
