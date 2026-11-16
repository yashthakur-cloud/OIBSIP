import { useEffect, useMemo, useState } from 'react'
import { AlertTriangle, Check, ClipboardList, Package, Plus, RefreshCw, ShoppingBag } from 'lucide-react'
import { io } from 'socket.io-client'
import api from '../api/axios'

const socketUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'
const statuses = ['Order Received', 'In Kitchen', 'Sent to Delivery']

function ingredientTags(item) {
  return [item.base, item.sauce, item.cheese, ...(item.veggies || [])].filter(Boolean)
}

function categoryLabel(category) {
  return `${category[0].toUpperCase()}${category.slice(1)}s`
}

export default function AdminDashboard() {
  const [tab, setTab] = useState('orders')
  const [orders, setOrders] = useState([])
  const [inventory, setInventory] = useState([])
  const [error, setError] = useState('')
  const [savingStatus, setSavingStatus] = useState('')
  const [restocking, setRestocking] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [newItem, setNewItem] = useState({ name: '', category: 'base', price: '', stockCount: 50, threshold: 20 })
  const grouped = useMemo(() => inventory.reduce((result, item) => { ;(result[item.category] ||= []).push(item); return result }, {}), [inventory])
  const lowStockCount = inventory.filter((item) => item.stockCount < item.threshold).length
  const activeOrders = orders.filter((order) => order.orderStatus !== 'Sent to Delivery').length
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
  const updateStatus = async (id, orderStatus) => {
    try { setSavingStatus(`${id}-${orderStatus}`); const { data } = await api.put(`/orders/${id}/status`, { orderStatus }); setOrders((current) => current.map((order) => order._id === id ? { ...order, ...data } : order)) } catch (err) { setError(err.response?.data?.message || 'Could not update status') } finally { setSavingStatus('') }
  }
  const restock = async (id) => {
    try { setRestocking(id); const { data } = await api.put(`/inventory/${id}/restock`, { amount: 10 }); setInventory((current) => current.map((item) => item._id === id ? data : item)) } catch (err) { setError(err.response?.data?.message || 'Could not restock item') } finally { setRestocking('') }
  }
  const addIngredient = async (event) => {
    event.preventDefault()
    try { const { data } = await api.post('/inventory', { ...newItem, price: Number(newItem.price), stockCount: Number(newItem.stockCount), threshold: Number(newItem.threshold) }); setInventory((current) => [...current, data]); setNewItem({ name: '', category: 'base', price: '', stockCount: 50, threshold: 20 }); setShowForm(false) } catch (err) { setError(err.response?.data?.message || 'Could not add ingredient') }
  }
  return (
    <main className="page-shell">
      <div className="page-intro"><div><span className="eyebrow">Kitchen control room</span><h1>Good morning, Chef.</h1><p className="muted">Keep every order moving and every ingredient fresh.</p></div><span className="live-badge"><span className="live-dot" /> Live operations</span></div>
      <div className="kpi-grid"><div className="card kpi-card"><span className="kpi-icon"><ClipboardList size={19} /></span><span><span className="kpi-label">Total Orders</span><span className="kpi-value">{orders.length}</span></span></div><div className="card kpi-card"><span className="kpi-icon"><ShoppingBag size={19} /></span><span><span className="kpi-label">Active in Progress</span><span className="kpi-value">{activeOrders}</span></span></div><div className="card kpi-card"><span className="kpi-icon" style={lowStockCount ? { color: '#b91c1c', background: '#fee2e2' } : {}}><AlertTriangle size={19} /></span><span><span className="kpi-label">Low-Stock Alerts</span><span className="kpi-value" style={lowStockCount ? { color: '#b91c1c' } : {}}>{lowStockCount}</span></span></div></div>
      <div className="dashboard-tabs"><button className={`tab ${tab === 'orders' ? 'active-tab' : ''}`} onClick={() => setTab('orders')}><ClipboardList size={15} /> Live Orders <span className="tab-count">{orders.length}</span></button><button className={`tab ${tab === 'inventory' ? 'active-tab' : ''}`} onClick={() => setTab('inventory')}><Package size={15} /> Inventory Manager {lowStockCount > 0 && <span className="tab-count">{lowStockCount}</span>}</button></div>
      {error && <p className="alert error">{error}</p>}
      {tab === 'orders' ? <div className="order-list">{!orders.length && <div className="card empty-state"><ClipboardList size={34} color="#d6d3d1" /><h3>No orders yet</h3><p className="muted">New paid orders will appear here in real time.</p></div>}{orders.map((order) => <article className="card order-card" key={order._id}><div className="order-heading"><div><span className="order-id">ORDER #{order._id.slice(-6).toUpperCase()}</span><h2 style={{ marginTop: '9px' }}>{order.user?.name}</h2><p className="muted" style={{ fontSize: '.74rem' }}>{order.user?.email} · {order.deliveryAddress}</p></div><strong>₹{order.totalAmount}</strong></div>{order.items.map((item, index) => <div className="ingredient-tags" key={index}>{ingredientTags(item).map((ingredient) => <span className="ingredient-tag" key={ingredient._id}>{ingredient.name}</span>)}</div>)}<p className="payment-badge"><Check size={14} /> {order.paymentInfo?.status} · {order.paymentInfo?.razorpayPaymentId}</p><div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px', marginTop: '17px' }}>{statuses.map((status) => <button key={status} className={order.orderStatus === status ? 'primary-button small-button' : 'secondary-button small-button'} disabled={savingStatus === `${order._id}-${status}`} onClick={() => updateStatus(order._id, status)}>{savingStatus === `${order._id}-${status}` ? <RefreshCw size={13} className="spin" /> : status}</button>)}</div></article>)}</div> : <div className="inventory-layout"><div>{Object.entries(grouped).map(([category, items]) => <section key={category}><h2 className="category-title">{categoryLabel(category)} <span className="muted" style={{ fontSize: '.68rem' }}>({items.length})</span></h2><div className="inventory-grid">{items.map((item) => { const low = item.stockCount < item.threshold; const percent = Math.min(100, (item.stockCount / Math.max(item.threshold * 2, 1)) * 100); return <div className={`card inventory-item ${low ? 'low-stock' : ''}`} key={item._id}><div className="inventory-top"><div><div className="inventory-name">{item.name}</div><div className="inventory-price">₹{item.price}</div></div>{low && <span className="low-badge">Low Stock</span>}</div><div className="stock-bar"><div className={`stock-fill ${low ? 'low' : ''}`} style={{ width: `${percent}%` }} /></div><div className="stock-meta"><span>{item.stockCount} in stock · threshold {item.threshold}</span><button className="restock-button" disabled={restocking === item._id} onClick={() => restock(item._id)}>{restocking === item._id ? <RefreshCw size={12} className="spin" /> : '+10 Restock'}</button></div></div> })}</div></section>)}</div><div className="add-form">{!showForm ? <button className="card secondary-button" style={{ width: '100%', textAlign: 'left' }} onClick={() => setShowForm(true)}><Plus size={16} style={{ verticalAlign: 'middle' }} /> Add New Ingredient</button> : <form className="card form" onSubmit={addIngredient}><div className="form-title"><h2>Add Ingredient</h2><button className="secondary-button small-button" type="button" onClick={() => setShowForm(false)}>Close</button></div><label className="field">Name<input required value={newItem.name} onChange={(e) => setNewItem({ ...newItem, name: e.target.value })} /></label><label className="field">Category<select className="select-input" value={newItem.category} onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}>{['base', 'sauce', 'cheese', 'veggie'].map((value) => <option key={value}>{value}</option>)}</select></label><label className="field">Price<input type="number" min="0" required value={newItem.price} onChange={(e) => setNewItem({ ...newItem, price: e.target.value })} /></label><label className="field">Stock count<input type="number" min="0" required value={newItem.stockCount} onChange={(e) => setNewItem({ ...newItem, stockCount: e.target.value })} /></label><label className="field">Threshold<input type="number" min="0" required value={newItem.threshold} onChange={(e) => setNewItem({ ...newItem, threshold: e.target.value })} /></label><button className="primary-button">Add ingredient</button></form>}</div></div>}
    </main>
  )
}
