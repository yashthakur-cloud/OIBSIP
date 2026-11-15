import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import api from '../api/axios'

export default function VerifyEmail() {
  const { token } = useParams(); const [message, setMessage] = useState('Verifying your email...'); const [error, setError] = useState('')
  useEffect(() => { api.get(`/auth/verify/${token}`).then(({ data }) => setMessage(data.message)).catch((err) => { setError(err.response?.data?.message || 'Verification failed'); setMessage('') }) }, [token])
  return <div className="auth-page"><div className="card auth-card">{message && <p className="success">{message}</p>}{error && <p className="error">{error}</p>}<Link to="/login">Continue to login</Link></div></div>
}
