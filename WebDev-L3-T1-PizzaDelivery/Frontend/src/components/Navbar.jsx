import { Link } from 'react-router-dom'
import useAuth from '../context/useAuth'

export default function Navbar() {
  const { user, logout } = useAuth()
  return (
    <nav className="app-nav">
      <div className="nav-inner">
        <Link className="brand" to="/">Pizza<span>Craft</span></Link>
        <div className="nav-links">
          {user?.role === 'customer' && <><Link to="/dashboard">Build Pizza</Link><Link to="/orders">My Orders</Link></>}
          {user?.role === 'admin' && <Link to="/admin">Admin Dashboard</Link>}
          {user ? <button className="logout" onClick={logout}>Logout</button> : <><Link to="/login">Login</Link><Link to="/register">Register</Link></>}
        </div>
      </div>
    </nav>
  )
}
