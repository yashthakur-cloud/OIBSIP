import { useEffect, useState } from 'react'
import { CheckCircle2 } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import api from '../api/axios'
import AuthShell from '../components/AuthShell'

export default function VerifyEmail() {
  const { token } = useParams()
  const [message, setMessage] = useState('Confirming your email...')
  const [error, setError] = useState('')
  useEffect(() => {
    api.get(`/auth/verify/${token}`).then(({ data }) => setMessage(data.message)).catch((err) => { setError(err.response?.data?.message || 'Verification failed'); setMessage('') })
  }, [token])
  return <AuthShell eyebrow="Almost there" title="Verify your email." description="One quick confirmation and your pizza journey can begin.">{message && <p className="alert success"><CheckCircle2 size={16} />{message}</p>}{error && <p className="alert error">{error}</p>}<Link className="primary-button" to="/login" style={{ marginTop: '18px' }}>Continue to login</Link></AuthShell>
}
