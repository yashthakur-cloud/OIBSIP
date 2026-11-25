import { useEffect, useState } from 'react'
import { Bike, MapPin, Receipt, ShieldCheck } from 'lucide-react'
import { io } from 'socket.io-client'
import api from '../api/axios'
import StatusTracker from '../components/StatusTracker'

const socketUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'

function ingredientTags(item) {
  return [
    ['Base', item.base],
    ['Sauce', item.sauce],
    ['Cheese', item.cheese],
    ...((item.veggies || []).map((veggie) => ['Veggie', veggie])),
  ].filter(([, value]) => value)
}

export default function OrderTracking() {
  const [orders, setOrders] = useState([])
  const [error, setError] = useState('')
  useEffect(() => {
    api.get('/orders/myorders').then(({ data }) => setOrders(data)).catch((err) => setError(err.response?.data?.message || 'Could not load your orders'))
  }, [])
  useEffect(() => {
    const socket = io(socketUrl)
    const listeners = orders.map((order) => {
      const event = `orderStatus_${order._id}`
      const handler = (status) => setOrders((current) => current.map((item) => item._id === order._id ? { ...item, orderStatus: status } : item))
      socket.on(event, handler)
      return [event, handler]
    })
    return () => { listeners.forEach(([event, handler]) => socket.off(event, handler)); socket.disconnect() }
  }, [orders])
  return (
    <main className="page-shell">
      <div className="page-intro"><div><span className="eyebrow">Live kitchen sync</span><h1>Orders on the way</h1><p className="muted">Every stage, from our kitchen to your doorstep.</p></div><Bike color="#d92323" size={34} /></div>
      {error && <p className="alert error">{error}</p>}
      {!orders.length && !error && <div className="card empty-state"><Receipt size={34} color="#d6d3d1" /><h3>No orders yet</h3><p className="muted">Your next custom creation will show up here.</p></div>}
      <div className="order-list">
        {orders.map((order) => (
          <article className="card order-card" key={order._id}>
            <div className="order-heading"><div><span className="order-id">ORDER #{order._id.slice(-6).toUpperCase()}</span><p className="muted" style={{ fontSize: '.72rem', marginTop: '8px' }}>{new Date(order.createdAt).toLocaleString()}</p></div><strong>₹{order.totalAmount}</strong></div>
            <StatusTracker status={order.orderStatus} />
            {order.items.map((item, index) => <div key={`${order._id}-${index}`}><div className="ingredient-tags">{ingredientTags(item).map(([label, ingredient]) => <span className="ingredient-tag" key={`${label}-${ingredient._id}`}>{label}: {ingredient.name}</span>)}</div><p className="muted" style={{ fontSize: '.72rem' }}>Quantity: {item.quantity || 1}</p></div>)}
            <p className="detail-line"><MapPin size={16} color="#d92323" /><span><strong>Delivery to:</strong> {order.deliveryAddress}</span></p>
            <span className="payment-badge"><ShieldCheck size={14} /> Paid · Razorpay ID: {order.paymentInfo?.razorpayPaymentId || 'Unavailable'}</span>
          </article>
        ))}
      </div>
    </main>
  )
}
