import Versions from './components/Versions'
import electronLogo from './assets/electron.svg'
import Portal from './components/Protal'

function App(): JSX.Element {
  const ipcHandle = (): void => window.electron.ipcRenderer.send('ping')

  return (
    <>
      <Portal />
    </>
  )
}

export default App
