import { useEffect, useMemo, useState } from 'react'
import { io } from 'socket.io-client'
import api from '../api/axios'

const socketUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'
const statuses = ['Order Received', 'In Kitchen', 'Sent to Delivery']

function names(item) {
  return [item.base, item.sauce, item.cheese, ...(item.veggies || [])].filter(Boolean).map((value) => value.name).join(' · ')
}

export default function AdminDashboard() {
  const [tab, setTab] = useState('orders')
  const [orders, setOrders] = useState([])
  const [inventory, setInventory] = useState([])
  const [error, setError] = useState('')
  const [newItem, setNewItem] = useState({ name: '', category: 'base', price: '', stockCount: 50, threshold: 20 })
  const grouped = useMemo(() => inventory.reduce((result, item) => { (result[item.category] ||= []).push(item); return result }, {}), [inventory])

  const loadData = async () => {
    try { const [ordersResponse, inventoryResponse] = await Promise.all([api.get('/orders'), api.get('/inventory')]); setOrders(ordersResponse.data); setInventory(inventoryResponse.data); setError('') } catch (err) { setError(err.response?.data?.message || 'Could not load admin data') }
  }
  // The API request synchronizes component state with external data.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { loadData() }, [])
  useEffect(() => {
    const socket = io(socketUrl)
    const addOrder = (order) => setOrders((current) => [order, ...current.filter((item) => item._id !== order._id)])
    socket.on('newOrder', addOrder)
    return () => { socket.off('newOrder', addOrder); socket.disconnect() }
  }, [])

  const updateStatus = async (id, orderStatus) => { try { const { data } = await api.put(`/orders/${id}/status`, { orderStatus }); setOrders((current) => current.map((order) => order._id === id ? { ...order, ...data } : order)) } catch (err) { setError(err.response?.data?.message || 'Could not update status') } }
  const restock = async (id) => { try { const { data } = await api.put(`/inventory/${id}/restock`, { amount: 10 }); setInventory((current) => current.map((item) => item._id === id ? data : item)) } catch (err) { setError(err.response?.data?.message || 'Could not restock item') } }
  const addIngredient = async (event) => { event.preventDefault(); try { const { data } = await api.post('/inventory', { ...newItem, price: Number(newItem.price), stockCount: Number(newItem.stockCount), threshold: Number(newItem.threshold) }); setInventory((current) => [...current, data]); setNewItem({ name: '', category: 'base', price: '', stockCount: 50, threshold: 20 }) } catch (err) { setError(err.response?.data?.message || 'Could not add ingredient') } }

  return (
    <main className="page-shell">
      <span className="eyebrow">Store control room</span><h1>Admin dashboard</h1>
      <div className="dashboard-tabs"><button className={tab === 'orders' ? 'tab active-tab' : 'tab'} onClick={() => setTab('orders')}>Live Orders</button><button className={tab === 'inventory' ? 'tab active-tab' : 'tab'} onClick={() => setTab('inventory')}>Inventory Manager</button></div>
      {error && <p className="error">{error}</p>}
      {tab === 'orders' ? <div className="order-list">{!orders.length && <p className="card muted">No orders yet.</p>}{orders.map((order) => <article className="card order-card" key={order._id}><div className="order-heading"><div><h2>#{order._id.slice(-6).toUpperCase()} · {order.user?.name}</h2><p className="muted">{order.user?.email} · {order.deliveryAddress}</p></div><strong>₹{order.totalAmount}</strong></div>{order.items.map((item, index) => <p className="order-detail" key={index}><strong>Pizza × {item.quantity || 1}</strong><span>{names(item)}</span></p>)}<p><strong>Payment:</strong> {order.paymentInfo?.status} · {order.paymentInfo?.razorpayPaymentId}</p><select className="select-input" value={order.orderStatus} onChange={(event) => updateStatus(order._id, event.target.value)}>{statuses.map((status) => <option key={status}>{status}</option>)}</select></article>)}</div> : <div className="inventory-layout"><div>{Object.entries(grouped).map(([category, items]) => <section key={category}><h2 className="category-title">{category}</h2><div className="inventory-grid">{items.map((item) => <div className={`card inventory-item ${item.stockCount < item.threshold ? 'low-stock' : ''}`} key={item._id}><div><strong>{item.name}</strong><p className="muted">₹{item.price} · Stock: {item.stockCount}</p>{item.stockCount < item.threshold && <span className="badge">Low Stock</span>}</div><button className="primary-button small-button" onClick={() => restock(item._id)}>+10 Restock</button></div>)}</div></section>)}</div><form className="card form" onSubmit={addIngredient}><h2>Add New Ingredient</h2><label>Name<input required value={newItem.name} onChange={(e) => setNewItem({ ...newItem, name: e.target.value })} /></label><label>Category<select className="select-input" value={newItem.category} onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}>{['base', 'sauce', 'cheese', 'veggie'].map((value) => <option key={value}>{value}</option>)}</select></label><label>Price<input type="number" min="0" required value={newItem.price} onChange={(e) => setNewItem({ ...newItem, price: e.target.value })} /></label><label>Stock count<input type="number" min="0" required value={newItem.stockCount} onChange={(e) => setNewItem({ ...newItem, stockCount: e.target.value })} /></label><label>Threshold<input type="number" min="0" required value={newItem.threshold} onChange={(e) => setNewItem({ ...newItem, threshold: e.target.value })} /></label><button className="primary-button">Add ingredient</button></form></div>}
    </main>
  )
}
