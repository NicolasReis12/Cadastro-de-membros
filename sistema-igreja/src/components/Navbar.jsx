import { NavLink } from 'react-router-dom'
import './Navbar.css'

function Navbar() {
  return (
    <nav className="navbar">
      <div className="logo">
        <div className="logo-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
        </div>
        <div>
          <div className="logo-title">IEQ SEDE</div>
          <div className="logo-subtitle">Sistema de membros</div>
        </div>
      </div>

      <div className="menu">
        <NavLink className={({ isActive }) => 'link' + (isActive ? ' active' : '')} to="/">Dashboard</NavLink>
        <NavLink className={({ isActive }) => 'link' + (isActive ? ' active' : '')} to="/membros">Membros</NavLink>
        <NavLink className={({ isActive }) => 'link' + (isActive ? ' active' : '')} to="/dizimos">Dízimos</NavLink>
        <NavLink className={({ isActive }) => 'link' + (isActive ? ' active' : '')} to="/aniversariantes">Aniversariantes</NavLink>
      </div>
    </nav>
  )
}

export default Navbar