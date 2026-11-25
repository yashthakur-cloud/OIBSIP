import { Link, useLocation } from 'react-router-dom'
import { LogOut, Pizza } from 'lucide-react'
import useAuth from '../context/useAuth'

export default function Navbar() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const initials = user?.name?.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase()
  const isActive = (path) => location.pathname === path

  return (
    <nav className="app-nav">
      <div className="nav-inner">
        <Link className="brand-lockup" to="/">
          <span className="brand-mark"><Pizza size={22} strokeWidth={2.5} /></span>
          <span><span className="brand">Crust &amp; Craft</span><span className="brand-subtitle">Freshly baked</span></span>
        </Link>
        <div className="nav-links">
          {user?.role === 'customer' && <>
            <Link className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`} to="/dashboard">Build Pizza</Link>
            <Link className={`nav-link ${isActive('/orders') ? 'active' : ''}`} to="/orders">My Orders</Link>
          </>}
          {user?.role === 'admin' && <Link className={`nav-link ${isActive('/admin') ? 'active' : ''}`} to="/admin">Admin Panel</Link>}
          {user ? <>
            {user.role === 'admin' ? <span className="role-pill">Admin</span> : <span className="avatar">{initials}</span>}
            <button className="logout" onClick={logout}><LogOut size={14} /> Logout</button>
          </> : <><Link className="nav-link nav-login" to="/login">Login</Link><Link className="primary-button nav-signup" to="/register">Sign Up</Link></>}
        </div>
      </div>
    </nav>
  )
}
