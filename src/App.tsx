import { AppProvider } from './store/AppContext'
import { Shell } from './shell/Shell'
import './apps' // registra las apps al cargar

function App() {
  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  )
}

export default App
