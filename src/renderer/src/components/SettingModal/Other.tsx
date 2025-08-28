import { Checkbox, Flex, Radio, Space } from 'antd'
import { useEffect, useState } from 'react'
import {getDb} from '../../../../utils/dbFun'
import Rate0Png from '../../../../../resources/images/rate0.png'
import Rate90Png from '../../../../../resources/images/rate90.png'
import Rate180Png from '../../../../../resources/images/rate180.png'
import Rate270Png from '../../../../../resources/images/rate270.png'
import RateExamplePng from '../../../../../resources/images/rateExample.png'


const Other = (props: Record<string, boolean>) => {
  const [checked, setChecked] = useState(false)
  const [direction, setDirection] = useState<any>('row')

  const handleChange = (e) => {
    window.electronApi.changeAuto(e.target.checked)
  }

  useEffect(() => {
    setChecked(props.checked)
  }, [props.checked])

  useEffect(() => {
    window.electron.ipcRenderer.on('change-auto-response', (_event, data) => {
      setChecked(data)
    })
    window.electron.ipcRenderer.on('change-picture-direction-response', (_event, data) => {
      setDirection(data)
    })
  }, [])

  useEffect(() => {
    getDb('pictureDirection').then(res => {
      setDirection(res)
    })
  },[])

  const handleChangeDirection = (v) => {
    setDirection(v)
    window.electronApi.changePictureDirection(v)
  }


  return (
    <Flex vertical gap={12}>
      <Checkbox onChange={handleChange} checked={checked}>
        启用自动连续扫描
      </Checkbox>
      <div>
      <Flex align='start' gap={16}>
        <Flex vertical>
        <img src={RateExamplePng} className='pic-image-row'/>
        <div>实际单据内容方向</div>
        </Flex>
        <Radio.Group value={direction}  onChange={e => handleChangeDirection(e.target.value)} >
          <Space direction='vertical'>
        <Radio value={'row'}><Space>
              <div>水平投递</div>
              <img src={Rate0Png} className='pic-image-row' />
              <img src={Rate180Png} className='pic-image-row' />
            </Space></Radio>
            <Radio value={'col'}>
              <Space>
              <div>垂直投递</div>
              <img src={Rate90Png} className='pic-image-col ml-36'/>
              <img src={Rate270Png} className='pic-image-col ml-56' />
            </Space></Radio>
            </Space>
        </Radio.Group>
      </Flex>
      </div>
 
    </Flex>
  )
}
export default Other
