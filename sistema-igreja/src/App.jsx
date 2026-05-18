import { BrowserRouter, Routes, Route } from 'react-router-dom'
import AppLayout from './components/AppLayout'
import PrivateRoute from './components/PrivateRoute'
import Dashboard from './pages/Dashboard'
import Membros from './pages/Membros'
import Aniversariantes from './pages/Aniversariantes'
import Entradas from './pages/Entradas'
import Relatorios from './pages/Relatorios'
import Login from './pages/Login'
import Register from './pages/Register'
import ToastContainer, { useToast } from './components/ToastContainer'
import { createContext } from 'react'
import { AuthProvider } from './contexts/AuthContext'

export const ToastContext = createContext()

function App() {
  const { toasts, showToast, removeToast } = useToast()

  return (
    <AuthProvider>
      <ToastContext.Provider value={{ showToast }}>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route element={<PrivateRoute />}>
              <Route element={<AppLayout />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/membros" element={<Membros />} />
                <Route path="/aniversariantes" element={<Aniversariantes />} />
                <Route path="/entradas" element={<Entradas />} />
                <Route path="/relatorios" element={<Relatorios />} />
              </Route>
            </Route>
          </Routes>
          <ToastContainer toasts={toasts} onClose={removeToast} />
        </BrowserRouter>
      </ToastContext.Provider>
    </AuthProvider>
  )
}

export default App
