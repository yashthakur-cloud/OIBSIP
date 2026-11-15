import { useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' }); const [message, setMessage] = useState(''); const [error, setError] = useState('')
  const submit = async (event) => { event.preventDefault(); try { const { data } = await api.post('/auth/register', form); setMessage(data.message); setError('') } catch (err) { setError(err.response?.data?.message || 'Registration failed') } }
  return <div className="auth-page"><div className="card auth-card"><span className="eyebrow">Join the kitchen</span><h1>Create your account</h1>{message && <p className="success">{message}</p>}{error && <p className="error">{error}</p>}<form className="form" onSubmit={submit}><label>Name<input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label><label>Email<input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label><label>Password<input type="password" minLength="6" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></label><button className="primary-button">Register</button></form><p>Already registered? <Link to="/login">Log in</Link></p></div></div>
}
