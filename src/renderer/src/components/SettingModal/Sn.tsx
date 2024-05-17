import { Flex, QRCode } from 'antd'
const Sn = ({ uuid }) => {
  return (
    <div>
      <Flex vertical={true} gap={16} justify="center" align="center">
        <QRCode value={uuid} size={200}/>
        <div className="uuid">{uuid}</div>
      </Flex>
    </div>
  )
}
export default Sn
