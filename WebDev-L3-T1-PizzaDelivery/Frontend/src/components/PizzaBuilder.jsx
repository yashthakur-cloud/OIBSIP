import { useMemo, useState } from 'react'
import api from '../api/axios'

const labels = { base: '1. Choose a base', sauce: '2. Choose a sauce', cheese: '3. Choose a cheese', veggie: '4. Add veggies' }

export default function PizzaBuilder({ inventory }) {
  const [selection, setSelection] = useState({ base: null, sauce: null, cheese: null, veggies: [] }); const [quantity, setQuantity] = useState(1); const [address, setAddress] = useState(''); const [message, setMessage] = useState(''); const [error, setError] = useState('')
  const grouped = useMemo(() => inventory.reduce((result, item) => { (result[item.category] ||= []).push(item); return result }, {}), [inventory])
  const selectedItems = [selection.base, selection.sauce, selection.cheese, ...selection.veggies].filter(Boolean)
  const total = selectedItems.reduce((sum, item) => sum + item.price, 0) * quantity
  const choose = (category, item) => { if (item.stockCount <= 0) return; if (category === 'veggie') setSelection((current) => ({ ...current, veggies: current.veggies.some((value) => value._id === item._id) ? current.veggies.filter((value) => value._id !== item._id) : [...current.veggies, item] })); else setSelection((current) => ({ ...current, [category]: item })) }
  const pay = async () => {
    if (!selection.base || !selection.sauce || !selection.cheese || !address.trim()) { setError('Choose a base, sauce, cheese, and delivery address.'); return }
    try {
      setError(''); const { data: razorpayOrder } = await api.post('/orders/razorpay', { amount: total }); const Razorpay = window.Razorpay
      if (!Razorpay) throw new Error('Razorpay checkout is unavailable')
      new Razorpay({ key: import.meta.env.VITE_RAZORPAY_KEY_ID, amount: razorpayOrder.amount, currency: 'INR', name: 'PizzaCraft', order_id: razorpayOrder.id, handler: async (response) => { await api.post('/orders/verify', { ...response, items: [{ base: selection.base._id, sauce: selection.sauce._id, cheese: selection.cheese._id, veggies: selection.veggies.map((item) => item._id), quantity }], deliveryAddress: address, totalAmount: total }); setMessage('Payment successful! Your pizza is on its way.'); setSelection({ base: null, sauce: null, cheese: null, veggies: [] }) }, prefill: {} }).open()
    } catch (err) { setError(err.response?.data?.message || err.message || 'Payment could not be started') }
  }
  return <div className="builder-layout"><div>{['base', 'sauce', 'cheese', 'veggie'].map((category, index) => <section className="card step-card" key={category}><div className="step-title"><h2>{labels[category]}</h2><span className="muted">{index + 1}/4</span></div><div className="option-grid">{(grouped[category] || []).map((item) => { const selected = category === 'veggie' ? selection.veggies.some((value) => value._id === item._id) : selection[category]?._id === item._id; return <button className={`option ${selected ? 'selected' : ''}`} disabled={item.stockCount <= 0} onClick={() => choose(category, item)} key={item._id}><span className="option-name">{item.name}</span><span className="option-price">₹{item.price}</span>{item.stockCount <= 0 && <span className="badge">Out of Stock</span>}</button> })}</div></section>)}</div><aside className="card summary"><h2>Order summary</h2>{selectedItems.length ? selectedItems.map((item) => <div className="summary-row" key={item._id}><span>{item.name}</span><strong>₹{item.price}</strong></div>) : <p className="muted">Build your pizza to see the total.</p>}<div className="summary-row"><span>Quantity</span><span className="quantity"><button onClick={() => setQuantity(Math.max(1, quantity - 1))}>−</button>{quantity}<button onClick={() => setQuantity(quantity + 1)}>+</button></span></div><label className="form"><span>Delivery address</span><textarea rows="3" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Where should we deliver?" /></label><div className="total"><span>Total</span><span>₹{total}</span></div>{error && <p className="error">{error}</p>}{message && <p className="success">{message}</p>}<button className="primary-button" onClick={pay}>Pay with Razorpay</button></aside></div>
}
