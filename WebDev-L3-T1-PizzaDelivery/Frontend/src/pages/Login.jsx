import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import useAuth from '../context/useAuth'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const submit = async (event) => {
    event.preventDefault(); setError('')
    try { const user = await login(form); navigate(user.role === 'admin' ? '/admin' : '/dashboard') } catch (err) { setError(err.response?.data?.message || 'Unable to log in') }
  }
  return <div className="auth-page"><div className="card auth-card"><span className="eyebrow">Welcome back</span><h1>Log in to PizzaCraft</h1>{error && <p className="error">{error}</p>}<form className="form" onSubmit={submit}><label>Email<input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label><label>Password<input type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></label><button className="primary-button">Log in</button></form><p><Link to="/forgot-password">Forgot password?</Link> · <Link to="/register">Create account</Link></p><div className="demo-box"><strong>Demo admin:</strong> admin@pizzadelivery.com / admin123</div></div></div>
}
