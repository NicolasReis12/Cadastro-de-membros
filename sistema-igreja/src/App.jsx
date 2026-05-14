import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Dashboard from './pages/Dashboard'
import Membros from './pages/Membros'
import Dizimos from './pages/Dizimos'
import Aniversariantes from './pages/Aniversariantes'
import ToastContainer, { useToast } from './components/ToastContainer'
import { createContext } from 'react'

export const ToastContext = createContext()

function App() {
  const { toasts, showToast, removeToast } = useToast()

  return (
    <ToastContext.Provider value={{ showToast }}>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/membros" element={<Membros />} />
          <Route path="/dizimos" element={<Dizimos />} />
          <Route path="/aniversariantes" element={<Aniversariantes />} />
        </Routes>
        <ToastContainer toasts={toasts} onClose={removeToast} />
      </BrowserRouter>
    </ToastContext.Provider>
  )
}

export default App