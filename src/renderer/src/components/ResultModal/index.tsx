import { useEffect, useState } from 'react'
import { Modal, Result } from 'antd'
import { useCountDown } from 'ahooks'

interface IProps {
  visible: boolean
  onCancel?: () => void
  onOk?: () => void
  [key: string]: any
}
const ResultModal = (props: IProps) => {
  const { visible, onOk, onCancel, status } = props
  const [targetDate, setTargetDate] = useState<number>()

  useEffect(() => {
    if (visible && status === 'success') {
      setTargetDate(Date.now() + 3000)
    }
  }, [visible, status])

  const [countdown] = useCountDown({
    targetDate,
    onEnd: () => {
      onCancel && onCancel()
    }
  })
  const handleOk = () => {
    onOk && onOk()
  }

  const handleCancel = () => {
    onCancel && onCancel()
  }

  const TEXT_MAP = {
    loading: {
      title: '正在回收，请稍后...'
    },
    success: {
      title: '回收成功',
      subTitle: `倒计时${Math.round(countdown / 1000)}s后关闭`
    },
    error: {
      title: '回收失败',
      subTitle: '请联系项目人员检查设备是否异常？或扫描仪是否卡纸或污损？'
    }
  }

  return (
    <Modal
      visible={visible}
      onOk={handleOk}
      onCancel={handleCancel}
      maskClosable={false}
      width={520}
      footer={null}
      centered
      styles={{
        body: {}
      }}
    >
      {status === 'loading' ? (
        <div
          style={{
            fontSize: 20,
            textAlign: 'center',
            margin: '100px  auto'
          }}
        >
          {TEXT_MAP[status]?.title}
        </div>
      ) : (
        <Result
          status={status}
          title={TEXT_MAP[status]?.title}
          subTitle={TEXT_MAP[status]?.subTitle}
        />
      )}
    </Modal>
  )
}
export default ResultModal
