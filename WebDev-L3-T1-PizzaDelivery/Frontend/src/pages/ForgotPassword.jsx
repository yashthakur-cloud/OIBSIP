import { useState } from 'react'
import { Mail } from 'lucide-react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import AuthShell from '../components/AuthShell'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const submit = async (event) => {
    event.preventDefault(); setLoading(true)
    try { const { data } = await api.post('/auth/forgot-password', { email }); setMessage(data.message); setError('') } catch (err) { setError(err.response?.data?.message || 'Request failed') } finally { setLoading(false) }
  }
  return <AuthShell eyebrow="Account recovery" title="Reset your password." description="We will send a secure reset link to your inbox.">{message && <p className="alert success">{message}</p>}{error && <p className="alert error">{error}</p>}<form className="form" onSubmit={submit}><label className="field">Email<span className="field-wrap"><Mail className="field-icon" size={17} /><input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" /></span></label><button className="primary-button" disabled={loading}>{loading ? <><span className="loading-spinner" /> Sending...</> : 'Send reset link'}</button></form><p className="auth-footer"><Link className="text-link" to="/login">Back to login</Link></p></AuthShell>
}
