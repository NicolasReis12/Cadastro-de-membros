import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

function PrivateRoute() {
  const { session, loading } = useAuth()

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#0f0e1a' }}>
        <div style={{ color: '#a5b4fc', fontSize: 14 }}>Carregando...</div>
      </div>
    )
  }

  return session ? <Outlet /> : <Navigate to="/login" replace />
}

export default PrivateRoute
