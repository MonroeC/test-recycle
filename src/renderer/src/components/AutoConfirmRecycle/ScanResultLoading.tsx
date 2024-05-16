import { useEffect, useState } from 'react'
import { Modal, Result, Spin } from 'antd'
import { useCountDown } from 'ahooks'

const ERR_MAP = {
  40000020: '扫描单据有卡纸',
  40000021: '检测到双进给',
  40008002: '超时未检测到可扫描单据',
  40008003: 'ADF Conver open ',
  80000002: '扫描仪启动失败，请刷新重试',
  80000003: '缺少所需文件',
  80000005: '内存不足，无法运行',
  80000006: '没有足够的可用磁盘空间来运行',
  80000007: '无法写入磁盘',
  80000008: '无法从磁盘读取',
  80000009: '指定操作无效',
  80020001: '不支持指定型号',
  80020002: '未安装指定型号的扫描仪驱动程序',
  80020003: '无法打开扫描仪驱动程序',
  80030001: '扫描操作失败'
}

interface IProps {
  visible: boolean
  onCancel?: () => void
  onOk?: () => void
  [key: string]: any
}
const ScanResultLoading = (props: IProps) => {
  const { visible, onOk, onCancel, autoErrCode, isExistPicture } = props
  const [targetDate, setTargetDate] = useState<number>()
  const [targetDate1, setTargetDate1] = useState<number>()
  const [targetDate2, setTargetDate2] = useState<number>()
  const [status, setStatus] = useState<any>()

  useEffect(() => {
    if (visible) {
      if (autoErrCode) {
        setStatus('error')
        setTargetDate(Date.now() + 3000)
      } else {
        setStatus('info')
        setTargetDate(Date.now() + 0)
      }
    }
  }, [visible])

  useCountDown({
    targetDate,
    onEnd: () => {
      if (isExistPicture) {
        setStatus('info')
        setTargetDate1(Date.now() + 2000)
      } else {
        onCancel && onCancel()
      }
    }
  })

  useCountDown({
    targetDate: targetDate1,
    onEnd: () => {
      setStatus('success')
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
    },
    error: {
      title: `${ERR_MAP[autoErrCode?.toString(16)] ?? '扫描异常'},本次连续扫描任务结束！`
    },
    info: {
      title: '扫描结果处理中'
    }
  }

  const icon = <Spin style={{ fontSize: 60 }} spinning={true}></Spin>

  return (
    <Modal open={visible} onOk={handleOk} maskClosable={false} width={400} footer={null} centered>
      <Result
        status={status}
        {...(status === 'info' ? { icon } : {})}
        title={TEXT_MAP[status]?.title}
        subTitle={TEXT_MAP[status]?.subTitle}
      />
    </Modal>
  )
}
export default ScanResultLoading
