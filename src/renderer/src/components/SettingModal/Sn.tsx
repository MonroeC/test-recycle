import { Flex } from 'antd'

const Sn = ({ uuid }) => {
  return (
    <div>
      <Flex vertical={true} gap={16} justify="center" align="center">
        <img alt="" className="tips-img" src="https://placehold.co/600x400" />
        <div className="uuid">{uuid}</div>
      </Flex>
    </div>
  )
}
export default Sn
