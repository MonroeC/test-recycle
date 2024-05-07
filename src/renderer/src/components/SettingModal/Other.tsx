import { Checkbox } from 'antd'
import { useEffect, useState } from 'react'

const Other = (props: Record<string, boolean>) => {
  const [checked, setChecked] = useState(false)
  const handleChange = (e) => {
    window.electronApi.changeAuto(e.target.checked)
  }

  useEffect(() => {
    setChecked(props.checked)
  }, [props.checked])

  useEffect(() => {
    window.electron.ipcRenderer.on('change-auto-response', (event, data) => {
      setChecked(data)
    })
  }, [])

  return (
    <div>
      <Checkbox onChange={handleChange} checked={checked}>
        启用自动连续扫描
      </Checkbox>
    </div>
  )
}
export default Other
