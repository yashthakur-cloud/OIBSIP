import { useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'

export default function ForgotPassword() {
  const [email, setEmail] = useState(''); const [message, setMessage] = useState(''); const [error, setError] = useState('')
  const submit = async (event) => { event.preventDefault(); try { const { data } = await api.post('/auth/forgot-password', { email }); setMessage(data.message); setError('') } catch (err) { setError(err.response?.data?.message || 'Request failed') } }
  return <div className="auth-page"><div className="card auth-card"><h1>Reset your password</h1>{message && <p className="success">{message}</p>}{error && <p className="error">{error}</p>}<form className="form" onSubmit={submit}><label>Email<input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></label><button className="primary-button">Send reset link</button></form><p><Link to="/login">Back to login</Link></p></div></div>
}
