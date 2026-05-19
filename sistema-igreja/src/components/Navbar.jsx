import { NavLink } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import logoIeq from '../assets/logo_ieq.png'
import './Navbar.css'

function Navbar() {
  const { igreja, isAdmin, permissoes, signOut } = useAuth()

  const canAccess = (modulo) => isAdmin || permissoes?.[modulo] === true

  return (
    <nav className="navbar">
      <div className="logo">
        <img src={logoIeq} alt="Logo IEQ" className="logo-img" />
        <div>
          <div className="logo-title">{igreja?.nome || 'Sistema de Membros'}</div>
          <div className="logo-subtitle">Sistema de membros</div>
        </div>
      </div>

      <div className="menu">
        {canAccess('dashboard') && (
          <NavLink className={({ isActive }) => 'link' + (isActive ? ' active' : '')} to="/">Dashboard</NavLink>
        )}
        {canAccess('membros') && (
          <NavLink className={({ isActive }) => 'link' + (isActive ? ' active' : '')} to="/membros">Membros</NavLink>
        )}
        {canAccess('entradas') && (
          <NavLink className={({ isActive }) => 'link' + (isActive ? ' active' : '')} to="/entradas">Dízimos</NavLink>
        )}
        {canAccess('ofertas') && (
          <NavLink className={({ isActive }) => 'link' + (isActive ? ' active' : '')} to="/ofertas">Ofertas</NavLink>
        )}
        {canAccess('ofertas_especiais') && (
          <NavLink className={({ isActive }) => 'link' + (isActive ? ' active' : '')} to="/ofertas-especiais">Of. Especiais</NavLink>
        )}
        {canAccess('aniversariantes') && (
          <NavLink className={({ isActive }) => 'link' + (isActive ? ' active' : '')} to="/aniversariantes">Aniversariantes</NavLink>
        )}
        {canAccess('relatorios') && (
          <NavLink className={({ isActive }) => 'link' + (isActive ? ' active' : '')} to="/relatorios">Relatórios</NavLink>
        )}
        {isAdmin && (
          <NavLink className={({ isActive }) => 'link' + (isActive ? ' active' : '')} to="/gerenciar-usuarios">Usuários</NavLink>
        )}
        <button className="btn-sair" onClick={signOut}>Sair</button>
      </div>
    </nav>
  )
}

export default Navbar
