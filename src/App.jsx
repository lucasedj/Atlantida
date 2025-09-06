import AppRoutes from './routes'
import { ContextHooks } from './context'

function App() {

  return (
    <>
      <ContextHooks>
        <AppRoutes />
      </ContextHooks>
    </>
  )
}

export default App