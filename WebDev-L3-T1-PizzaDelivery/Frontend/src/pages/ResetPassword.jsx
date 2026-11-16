import { useState } from 'react'
import { Eye, EyeOff, Lock } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import api from '../api/axios'
import AuthShell from '../components/AuthShell'

export default function ResetPassword() {
  const { token } = useParams()
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const submit = async (event) => {
    event.preventDefault(); setLoading(true)
    try { const { data } = await api.post(`/auth/reset-password/${token}`, { password }); setMessage(data.message); setError('') } catch (err) { setError(err.response?.data?.message || 'Reset failed') } finally { setLoading(false) }
  }
  return <AuthShell eyebrow="New password" title="Make it memorable." description="Choose a new password to get back into your account.">{message && <p className="alert success">{message}</p>}{error && <p className="alert error">{error}</p>}<form className="form" onSubmit={submit}><label className="field">New password<span className="field-wrap password"><Lock className="field-icon" size={17} /><input type={showPassword ? 'text' : 'password'} minLength="6" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" /><button className="password-toggle" type="button" onClick={() => setShowPassword((value) => !value)} aria-label="Toggle password visibility">{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></span></label><button className="primary-button" disabled={loading}>{loading ? <><span className="loading-spinner" /> Updating...</> : 'Update password'}</button></form><p className="auth-footer"><Link className="text-link" to="/login">Back to login</Link></p></AuthShell>
}
