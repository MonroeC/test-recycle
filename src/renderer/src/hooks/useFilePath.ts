import { useEffect, useState } from 'react'

const useFilePath = () => {
  const [filePath, setFilePath] = useState('')
  useEffect(() => {
    window.electron.ipcRenderer.on('recycle-pictures-filePath', (_event, arg) => {
      setFilePath(arg)
    })
  }, [])
  return {
    filePath
  }
}
export default useFilePath
