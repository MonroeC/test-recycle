import Header from '../Header'
import Content from '../Content'
import { Flex } from 'antd'
import { useState } from 'react'
const Portal = () => {
  const [networkStatus, setNetworkStatus] = useState(navigator.onLine ? 'online' : 'offline')

  const alertOnlineStatus = () => {
    setNetworkStatus(navigator.onLine ? 'online' : 'offline')
  }

  window.addEventListener('online', alertOnlineStatus)
  window.addEventListener('offline', alertOnlineStatus)
  return (
    <>
      <Header networkStatus={networkStatus} />
      <Content flex={1} networkStatus={networkStatus} />
    </>
  )
}
export default Portal
