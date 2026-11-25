import { useEffect, useState } from 'react'
import { ArrowRight, Clock3, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import useAuth from '../context/useAuth'
import PizzaBuilder from '../components/PizzaBuilder'

export default function CustomerDashboard() {
  const { user } = useAuth()
  const [inventory, setInventory] = useState([])
  const [error, setError] = useState('')
  useEffect(() => {
    api.get('/inventory').then(({ data }) => setInventory(data)).catch((err) => setError(err.response?.data?.message || 'Could not load ingredients'))
  }, [])
  return (
    <main className="page-shell">
      <section className="hero-banner">
        <span className="eyebrow" style={{ color: '#fbbf24' }}><Sparkles size={12} style={{ verticalAlign: 'middle' }} /> Made your way</span>
        <h1>Welcome back, {user?.name?.split(' ')[0] || 'pizza lover'}.</h1>
        <p>Build your Signature Pizza with hand-picked ingredients and follow it from oven to doorstep.</p>
        <Link className="hero-action" to="/orders">View active orders <ArrowRight size={14} style={{ verticalAlign: 'middle' }} /></Link>
      </section>
      <div className="page-intro"><div><span className="eyebrow">The craft is yours</span><h1>Build your Signature Pizza</h1><p className="muted">Four simple steps. Endless delicious combinations.</p></div><span className="muted" style={{ fontSize: '.76rem' }}><Clock3 size={14} style={{ verticalAlign: 'middle' }} /> Made fresh to order</span></div>
      {error && <p className="alert error">{error}</p>}
      {inventory.length ? <PizzaBuilder inventory={inventory} /> : !error && <p className="card muted empty-state">Loading today&apos;s ingredients...</p>}
    </main>
  )
}
