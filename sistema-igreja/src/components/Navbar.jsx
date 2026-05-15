import { NavLink } from 'react-router-dom'
import './Navbar.css'

function Navbar() {
  return (
    <nav className="navbar">
      <div className="logo">
        <div className="logo-icon">
          <div className="logo-icon-q q-red"></div>
          <div className="logo-icon-q q-yellow"></div>
          <div className="logo-icon-q q-blue"></div>
          <div className="logo-icon-q q-purple"></div>
        </div>
        <div>
          <div className="logo-title">IEQ SEDE</div>
          <div className="logo-subtitle">Sistema de membros</div>
        </div>
      </div>

      <div className="menu">
        <NavLink className={({ isActive }) => 'link' + (isActive ? ' active' : '')} to="/">Dashboard</NavLink>
        <NavLink className={({ isActive }) => 'link' + (isActive ? ' active' : '')} to="/membros">Membros</NavLink>
        <NavLink className={({ isActive }) => 'link' + (isActive ? ' active' : '')} to="/entradas">Dízimos</NavLink>
        <NavLink className={({ isActive }) => 'link' + (isActive ? ' active' : '')} to="/aniversariantes">Aniversariantes</NavLink>
        <NavLink className={({ isActive }) => 'link' + (isActive ? ' active' : '')} to="/relatorios">Relatórios</NavLink>
      </div>
    </nav>
  )
}

export default Navbar
