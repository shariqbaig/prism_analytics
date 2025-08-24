import { RouterProvider } from 'react-router-dom'
import { router } from '@/lib/router'
import './index.css'

function App() {
  return <RouterProvider router={router} />
}

export default App