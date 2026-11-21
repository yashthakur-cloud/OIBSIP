import { useMemo, useState } from 'react'
import { Check, CircleAlert, MapPin, Minus, Plus, ShieldCheck } from 'lucide-react'
import api from '../api/axios'
import PizzaVisualPreview from './PizzaVisualPreview'

const labels = {
  base: 'Crust Base',
  sauce: 'Signature Sauce',
  cheese: 'Cheese',
  veggie: 'Fresh Veggies',
}

const icons = { base: '🍞', sauce: '🍅', cheese: '🧀', veggie: '🌿' }

export default function PizzaBuilder({ inventory }) {
  const [selection, setSelection] = useState({ base: null, sauce: null, cheese: null, veggies: [] })
  const [quantity, setQuantity] = useState(1)
  const [address, setAddress] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [paying, setPaying] = useState(false)
  const grouped = useMemo(() => inventory.reduce((result, item) => {
    ;(result[item.category] ||= []).push(item)
    return result
  }, {}), [inventory])
  const selectedItems = [selection.base, selection.sauce, selection.cheese, ...selection.veggies].filter(Boolean)
  const total = selectedItems.reduce((sum, item) => sum + item.price, 0) * quantity
  const requiredComplete = ['base', 'sauce', 'cheese'].filter((key) => selection[key]).length

  const choose = (category, item) => {
    if (item.stockCount <= 0) return
    if (category === 'veggie') {
      setSelection((current) => ({
        ...current,
        veggies: current.veggies.some((value) => value._id === item._id)
          ? current.veggies.filter((value) => value._id !== item._id)
          : [...current.veggies, item],
      }))
    } else {
      setSelection((current) => ({ ...current, [category]: item }))
    }
  }

  const pay = async () => {
    if (!selection.base || !selection.sauce || !selection.cheese || !address.trim()) {
      setError('Choose a base, sauce, cheese, and delivery address.')
      return
    }
    try {
      setPaying(true)
      setError('')
      const { data: razorpayOrder } = await api.post('/orders/razorpay', { amount: total })
      const Razorpay = window.Razorpay
      if (!Razorpay) throw new Error('Razorpay checkout is unavailable')
      const checkout = new Razorpay({
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: razorpayOrder.amount,
        currency: 'INR',
        name: 'Crust & Craft',
        order_id: razorpayOrder.id,
        handler: async (response) => {
          await api.post('/orders/verify', {
            ...response,
            items: [{
              base: selection.base._id,
              sauce: selection.sauce._id,
              cheese: selection.cheese._id,
              veggies: selection.veggies.map((item) => item._id),
              quantity,
            }],
            deliveryAddress: address,
            totalAmount: total,
          })
          setMessage('Payment successful! Your pizza is on its way.')
          setSelection({ base: null, sauce: null, cheese: null, veggies: [] })
          setQuantity(1)
        },
        prefill: {},
      })
      checkout.on('payment.failed', (response) => {
        const details = response.error || {}
        setError(details.description || details.reason || 'Razorpay could not complete the payment')
        setPaying(false)
      })
      checkout.open()
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Payment could not be started')
    } finally {
      setPaying(false)
    }
  }

  return (
    <div>
      <div className="progress-bar">
        {Object.keys(labels).map((category, index) => (
          <div className={`progress-step ${category === 'veggie' ? requiredComplete === 3 : selection[category] ? 'complete' : ''}`} key={category}>
            <span className="progress-number">{category !== 'veggie' && selection[category] ? <Check size={14} /> : index + 1}</span>
            <span>{labels[category]}</span>
          </div>
        ))}
      </div>
      <div className="builder-layout">
        <div>
          {Object.keys(labels).map((category) => (
            <section className="card step-card" key={category}>
              <div className="step-title">
                <div><span className="eyebrow">Step {Object.keys(labels).indexOf(category) + 1}</span><h2>{labels[category]}</h2></div>
                <span className="step-count">{category === 'veggie' ? 'Optional' : selection[category] ? 'Selected' : 'Required'}</span>
              </div>
              <div className="option-grid">
                {(grouped[category] || []).map((item) => {
                  const selected = category === 'veggie'
                    ? selection.veggies.some((value) => value._id === item._id)
                    : selection[category]?._id === item._id
                  const low = item.stockCount > 0 && item.stockCount < item.threshold
                  return (
                    <button className={`option ${selected ? 'selected' : ''}`} disabled={item.stockCount <= 0} onClick={() => choose(category, item)} key={item._id}>
                      <span className="option-icon">{icons[category]}</span>
                      {selected && <span className="option-check"><Check size={13} /></span>}
                      <span className="option-name">{item.name}</span>
                      <span className="option-price">₹{item.price}</span>
                      <span className={`stock-status ${item.stockCount <= 0 ? 'out' : low ? 'low' : ''}`}><span className="stock-dot" />{item.stockCount <= 0 ? 'Out of Stock' : low ? 'Low Stock' : 'In Stock'}</span>
                    </button>
                  )
                })}
              </div>
            </section>
          ))}
        </div>
        <aside className="card summary">
          <div className="summary-header"><span className="eyebrow">Your creation</span><h2>Live pizza preview</h2></div>
          <div className="visual-preview"><PizzaVisualPreview {...selection} /></div>
          <div className="summary-body">
            {selectedItems.length ? selectedItems.map((item) => <div className="summary-row" key={item._id}><span>{item.name}</span><strong>₹{item.price}</strong></div>) : <p className="muted">Select ingredients to see your receipt.</p>}
            <div className="summary-row"><span>Quantity</span><span className="quantity"><button aria-label="Decrease quantity" onClick={() => setQuantity(Math.max(1, quantity - 1))}><Minus size={13} /></button>{quantity}<button aria-label="Increase quantity" onClick={() => setQuantity(quantity + 1)}><Plus size={13} /></button></span></div>
            <label className="address-label" htmlFor="delivery-address"><MapPin size={14} /> Delivery Address</label>
            <textarea id="delivery-address" rows="3" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Where should we deliver?" />
            <div className="total"><span>Total Amount</span><strong>₹{total}</strong></div>
            {error && <p className="alert error"><CircleAlert size={15} />{error}</p>}
            {message && <p className="alert success"><ShieldCheck size={15} />{message}</p>}
            <button className="primary-button pay-button" onClick={pay} disabled={paying}>{paying ? <><span className="loading-spinner" /> Opening checkout...</> : `Pay ₹${total} with Razorpay`}</button>
            <p className="muted" style={{ fontSize: '.68rem', marginTop: '10px', textAlign: 'center' }}>Secure test-mode checkout</p>
          </div>
        </aside>
      </div>
    </div>
  )
}
