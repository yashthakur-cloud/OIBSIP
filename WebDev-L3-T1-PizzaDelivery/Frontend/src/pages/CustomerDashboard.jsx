import { useEffect, useState } from 'react'
import api from '../api/axios'
import PizzaBuilder from '../components/PizzaBuilder'

export default function CustomerDashboard() {
  const [inventory, setInventory] = useState([]); const [error, setError] = useState('')
  useEffect(() => { api.get('/inventory').then(({ data }) => setInventory(data)).catch((err) => setError(err.response?.data?.message || 'Could not load ingredients')) }, [])
  return <main className="page-shell"><span className="eyebrow">Freshly made for you</span><h1>Build your perfect pizza</h1><p className="muted">Choose your favorites, then we will deliver it hot.</p>{error && <p className="error">{error}</p>}{inventory.length ? <PizzaBuilder inventory={inventory} /> : !error && <p className="card">Loading ingredients...</p>}</main>
}
