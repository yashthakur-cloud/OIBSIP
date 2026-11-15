import { useEffect, useState } from 'react'
import { io } from 'socket.io-client'
import api from '../api/axios'
import StatusTracker from '../components/StatusTracker'

const socketUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'

function ingredientNames(item) {
  return [item.base, item.sauce, item.cheese, ...(item.veggies || [])].filter(Boolean).map((ingredient) => ingredient.name)
}

export default function OrderTracking() {
  const [orders, setOrders] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/orders/myorders')
      .then(({ data }) => setOrders(data))
      .catch((err) => setError(err.response?.data?.message || 'Could not load your orders'))
  }, [])

  useEffect(() => {
    const socket = io(socketUrl)
    const listeners = orders.map((order) => {
      const event = `orderStatus_${order._id}`
      const handler = (status) => setOrders((current) => current.map((item) => item._id === order._id ? { ...item, orderStatus: status } : item))
      socket.on(event, handler)
      return [event, handler]
    })
    return () => {
      listeners.forEach(([event, handler]) => socket.off(event, handler))
      socket.disconnect()
    }
  }, [orders])

  return (
    <main className="page-shell">
      <span className="eyebrow">Live order updates</span>
      <h1>My orders</h1>
      {error && <p className="error">{error}</p>}
      {!orders.length && !error && <p className="card muted">You have no orders yet.</p>}
      <div className="order-list">
        {orders.map((order) => (
          <article className="card order-card" key={order._id}>
            <div className="order-heading"><div><h2>Pizza order #{order._id.slice(-6).toUpperCase()}</h2><p className="muted">{new Date(order.createdAt).toLocaleString()}</p></div><strong>₹{order.totalAmount}</strong></div>
            <StatusTracker status={order.orderStatus} />
            {order.items.map((item, index) => <div className="order-detail" key={`${order._id}-${index}`}><strong>Pizza × {item.quantity || 1}</strong><span>{ingredientNames(item).join(' · ')}</span></div>)}
            <p><strong>Delivery:</strong> {order.deliveryAddress}</p>
            <p><strong>Payment:</strong> {order.paymentInfo?.status} · ID: {order.paymentInfo?.razorpayPaymentId || 'Unavailable'}</p>
          </article>
        ))}
      </div>
    </main>
  )
}
