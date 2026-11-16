import { useState } from 'react'
import { Eye, EyeOff, Lock, Mail, UserRound } from 'lucide-react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import AuthShell from '../components/AuthShell'

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }))
  const submit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')
    try {
      const { data } = await api.post('/auth/register', form)
      setMessage(data.message)
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }
  return (
    <AuthShell eyebrow="Join the kitchen" title="Create your account." description="Save your pizza preferences and keep every order close at hand.">
      {message && <p className="alert success">{message}</p>}
      {error && <p className="alert error">{error}</p>}
      <form className="form" onSubmit={submit}>
        <label className="field">Full name<span className="field-wrap"><UserRound className="field-icon" size={17} /><input required value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="Your name" /></span></label>
        <label className="field">Email<span className="field-wrap"><Mail className="field-icon" size={17} /><input type="email" required value={form.email} onChange={(e) => update('email', e.target.value)} placeholder="you@example.com" /></span></label>
        <label className="field">Password<span className="field-wrap password"><Lock className="field-icon" size={17} /><input type={showPassword ? 'text' : 'password'} minLength="6" required value={form.password} onChange={(e) => update('password', e.target.value)} placeholder="At least 6 characters" /><button className="password-toggle" type="button" onClick={() => setShowPassword((value) => !value)} aria-label="Toggle password visibility">{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></span></label>
        <button className="primary-button" disabled={loading}>{loading ? <><span className="loading-spinner" /> Creating account...</> : 'Create my account'}</button>
      </form>
      <p className="auth-footer">Already have an account? <Link className="text-link" to="/login">Sign in</Link></p>
    </AuthShell>
  )
}
