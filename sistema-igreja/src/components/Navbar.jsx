import { NavLink } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import logoIeq from '../assets/logo_ieq.png'
import './Navbar.css'

function Navbar() {
  const { igreja, signOut } = useAuth()

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
        <NavLink className={({ isActive }) => 'link' + (isActive ? ' active' : '')} to="/">Dashboard</NavLink>
        <NavLink className={({ isActive }) => 'link' + (isActive ? ' active' : '')} to="/membros">Membros</NavLink>
        <NavLink className={({ isActive }) => 'link' + (isActive ? ' active' : '')} to="/entradas">Dízimos</NavLink>
        <NavLink className={({ isActive }) => 'link' + (isActive ? ' active' : '')} to="/aniversariantes">Aniversariantes</NavLink>
        <NavLink className={({ isActive }) => 'link' + (isActive ? ' active' : '')} to="/relatorios">Relatórios</NavLink>
        <button className="btn-sair" onClick={signOut}>Sair</button>
      </div>
    </nav>
  )
}

export default Navbar
