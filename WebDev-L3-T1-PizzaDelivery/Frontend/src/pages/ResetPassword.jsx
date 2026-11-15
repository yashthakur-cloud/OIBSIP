import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import api from '../api/axios'

export default function ResetPassword() {
  const { token } = useParams(); const [password, setPassword] = useState(''); const [message, setMessage] = useState(''); const [error, setError] = useState('')
  const submit = async (event) => { event.preventDefault(); try { const { data } = await api.post(`/auth/reset-password/${token}`, { password }); setMessage(data.message); setError('') } catch (err) { setError(err.response?.data?.message || 'Reset failed') } }
  return <div className="auth-page"><div className="card auth-card"><h1>Choose a new password</h1>{message && <p className="success">{message}</p>}{error && <p className="error">{error}</p>}<form className="form" onSubmit={submit}><label>New password<input type="password" minLength="6" required value={password} onChange={(e) => setPassword(e.target.value)} /></label><button className="primary-button">Update password</button></form><p><Link to="/login">Back to login</Link></p></div></div>
}
