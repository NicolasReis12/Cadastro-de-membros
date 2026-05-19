import { BrowserRouter, Routes, Route } from 'react-router-dom'
import AppLayout from './components/AppLayout'
import PrivateRoute from './components/PrivateRoute'
import { PermissionRoute, AdminRoute } from './components/PermissionRoute'
import Dashboard from './pages/Dashboard'
import Membros from './pages/Membros'
import Aniversariantes from './pages/Aniversariantes'
import Entradas from './pages/Entradas'
import Ofertas from './pages/Ofertas'
import OfertasEspeciais from './pages/OfertasEspeciais'
import Relatorios from './pages/Relatorios'
import GerenciarUsuarios from './pages/GerenciarUsuarios'
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

                <Route element={<PermissionRoute modulo="dashboard" />}>
                  <Route path="/" element={<Dashboard />} />
                </Route>

                <Route element={<PermissionRoute modulo="membros" />}>
                  <Route path="/membros" element={<Membros />} />
                </Route>

                <Route element={<PermissionRoute modulo="aniversariantes" />}>
                  <Route path="/aniversariantes" element={<Aniversariantes />} />
                </Route>

                <Route element={<PermissionRoute modulo="entradas" />}>
                  <Route path="/entradas" element={<Entradas />} />
                </Route>

                <Route element={<PermissionRoute modulo="ofertas" />}>
                  <Route path="/ofertas" element={<Ofertas />} />
                </Route>

                <Route element={<PermissionRoute modulo="ofertas_especiais" />}>
                  <Route path="/ofertas-especiais" element={<OfertasEspeciais />} />
                </Route>

                <Route element={<PermissionRoute modulo="relatorios" />}>
                  <Route path="/relatorios" element={<Relatorios />} />
                </Route>

                <Route element={<AdminRoute />}>
                  <Route path="/gerenciar-usuarios" element={<GerenciarUsuarios />} />
                </Route>

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
