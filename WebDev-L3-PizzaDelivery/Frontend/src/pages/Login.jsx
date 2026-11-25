import { useState } from 'react'
import { Eye, EyeOff, Lock, Mail, ShieldCheck } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import AuthShell from '../components/AuthShell'
import useAuth from '../context/useAuth'
import api from '../api/axios'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [resent, setResent] = useState('')
  const resendVerification = async () => {
    setResent('')
    setError('')
    try {
      const { data } = await api.post('/auth/resend-verification', { email: form.email })
      setResent(data.message)
    } catch (err) {
      setError(err.response?.data?.message || 'Could not resend verification email')
    }
  }
  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }))
  const submit = async (event) => {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      const user = await login(form)
      navigate(user.role === 'admin' ? '/admin' : '/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to log in')
    } finally {
      setLoading(false)
    }
  }
  return (
    <AuthShell eyebrow="Welcome back" title="Your next slice starts here." description="Sign in to build, pay for, and follow your custom pizza.">
      {error && <p className="alert error"><ShieldCheck size={15} />{error}</p>}
      {resent && <p className="alert success"><ShieldCheck size={15} />{resent}</p>}
      {error.includes('verify your email') && (
        <button className="secondary-button" type="button" onClick={resendVerification} style={{ marginBottom: '14px' }}>
          Resend verification email
        </button>
      )}
      <form className="form" onSubmit={submit}>
        <label className="field">Email
          <span className="field-wrap login-field"><Mail className="field-icon" size={17} /><input type="email" required value={form.email} onChange={(e) => update('email', e.target.value)} placeholder="you@example.com" /></span>
        </label>
        <label className="field">Password
          <span className="field-wrap password login-field"><Lock className="field-icon" size={17} /><input type={showPassword ? 'text' : 'password'} required value={form.password} onChange={(e) => update('password', e.target.value)} placeholder="Enter your password" /><button className="password-toggle" type="button" onClick={() => setShowPassword((value) => !value)} aria-label="Toggle password visibility">{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></span>
        </label>
        <div className="form-footer"><span /> <Link to="/forgot-password">Forgot password?</Link></div>
        <button className="primary-button" disabled={loading}>{loading ? <><span className="loading-spinner" /> Signing in...</> : 'Sign in to Crust & Craft'}</button>
      </form>
      <div className="demo-box"><span><strong>Quick Demo Login</strong>Admin account ready to explore</span><button type="button" onClick={() => setForm({ email: 'admin@pizzadelivery.com', password: 'admin123' })}>Autofill</button></div>
      <p className="auth-footer">New to Crust &amp; Craft? <Link className="text-link" to="/register">Create an account</Link></p>
    </AuthShell>
  )
}
