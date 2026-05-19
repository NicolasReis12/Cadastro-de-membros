import { useRef } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useContext } from 'react'
import { ToastContext } from '../App'

function LoadingScreen() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#0f0e1a' }}>
      <div style={{ color: '#a5b4fc', fontSize: 14 }}>Carregando...</div>
    </div>
  )
}

export function PermissionRoute({ modulo }) {
  const { isAdmin, permissoes, loading } = useAuth()
  const { showToast } = useContext(ToastContext)
  const location = useLocation()
  const hasToasted = useRef(false)

  if (loading) return <LoadingScreen />

  if (isAdmin || permissoes?.[modulo]) {
    hasToasted.current = false
    return <Outlet />
  }

  if (!hasToasted.current) {
    hasToasted.current = true
    setTimeout(() => showToast('Você não tem permissão para acessar este módulo.', 'error'), 0)
  }

  return <Navigate to="/" replace state={{ from: location }} />
}

export function AdminRoute() {
  const { isAdmin, loading } = useAuth()

  if (loading) return <LoadingScreen />
  if (!isAdmin) return <Navigate to="/" replace />

  return <Outlet />
}
