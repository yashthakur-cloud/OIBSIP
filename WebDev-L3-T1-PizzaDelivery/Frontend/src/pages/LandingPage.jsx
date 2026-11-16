import { useEffect, useMemo, useState } from 'react'
import { ArrowRight, ChefHat, CircleCheck, CreditCard, Flame, Leaf, MapPin, Pizza, Truck } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import useAuth from '../context/useAuth'

const categories = [
  { key: 'base', label: 'Pizza Bases', icon: Pizza, copy: 'Golden, crisp foundations' },
  { key: 'sauce', label: 'Signature Sauces', icon: Flame, copy: 'Slow-crafted flavour layers' },
  { key: 'cheese', label: 'Cheeses', icon: CircleCheck, copy: 'Melted, stretchy goodness' },
  { key: 'veggie', label: 'Fresh Veggies', icon: Leaf, copy: 'Colourful garden crunch' },
]

export default function LandingPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [inventory, setInventory] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/inventory')
      .then(({ data }) => setInventory(data))
      .catch((err) => setError(err.response?.data?.message || 'Our menu is taking a moment to warm up.'))
  }, [])

  const grouped = useMemo(() => inventory.reduce((result, item) => {
    ;(result[item.category] ||= []).push(item)
    return result
  }, {}), [inventory])

  const startOrder = () => navigate(user ? (user.role === 'admin' ? '/admin' : '/dashboard') : '/login')
  const exploreMenu = () => document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' })

  return (
    <main className="landing-page">
      <section className="landing-hero">
        <div className="landing-hero-copy">
          <span className="eyebrow landing-eyebrow"><Flame size={14} /> Fresh from our kitchen</span>
          <h1>Craft Your Signature Pizza, Tracked Live from Oven to Doorstep</h1>
          <p>Choose every layer, pay securely in an instant, and watch your handcrafted pizza make its journey to you.</p>
          <div className="landing-actions">
            <button className="primary-button landing-primary" onClick={startOrder}>Order &amp; Customize Now <ArrowRight size={17} /></button>
            <button className="secondary-button landing-secondary" onClick={exploreMenu}>Explore Menu &amp; Ingredients</button>
          </div>
          <div className="landing-trust"><span><CircleCheck size={15} /> Made to order</span><span><Truck size={15} /> Live order tracking</span></div>
        </div>
        <div className="landing-hero-art" aria-hidden="true">
          <div className="pizza-orbit orbit-one" /><div className="pizza-orbit orbit-two" />
          <div className="landing-pizza"><Pizza size={165} strokeWidth={1.2} /></div>
          <span className="ingredient-float ingredient-one">🍅</span><span className="ingredient-float ingredient-two">🌿</span><span className="ingredient-float ingredient-three">🧀</span>
        </div>
      </section>

      <section className="landing-section steps-section">
        <div className="section-heading"><span className="eyebrow">The Crust &amp; Craft way</span><h2>From your imagination to your doorstep</h2><p>Great pizza should feel personal, simple, and a little bit magical.</p></div>
        <div className="steps-grid">
          <article className="step-card landing-step"><span className="step-number">01</span><ChefHat size={25} /><h3>Pick Your 4 Layers</h3><p>Start with a base, add sauce and cheese, then finish with your favourite veggies.</p></article>
          <article className="step-card landing-step"><span className="step-number">02</span><CreditCard size={25} /><h3>Instant Razorpay Checkout</h3><p>Pay safely in seconds and get your order moving with a secure checkout.</p></article>
          <article className="step-card landing-step"><span className="step-number">03</span><MapPin size={25} /><h3>Real-Time Live Kitchen Tracking</h3><p>Follow every milestone from the first toss to the final delivery handoff.</p></article>
        </div>
      </section>

      <section className="landing-section menu-section" id="menu">
        <div className="section-heading menu-heading"><div><span className="eyebrow">Freshly stocked today</span><h2>Meet your ingredients</h2><p>Build a combination that is unmistakably yours.</p></div><span className="menu-note">Tap an ingredient to start building</span></div>
        {error && <p className="alert error">{error}</p>}
        {!error && !inventory.length && <p className="card muted empty-state">Loading today&apos;s ingredients...</p>}
        <div className="menu-grid">
          {categories.map(({ key, label, icon: Icon, copy }) => (
            <article className="menu-category card" key={key}>
              <div className="menu-category-heading"><span className="menu-icon"><Icon size={20} /></span><div><h3>{label}</h3><p>{copy}</p></div></div>
              <div className="menu-items">
                {(grouped[key] || []).map((item) => <button className="menu-item" key={item._id} onClick={startOrder}><span>{item.name}</span><strong>₹{item.price}</strong></button>)}
                {!grouped[key]?.length && inventory.length > 0 && <span className="muted menu-empty">Coming fresh from the kitchen</span>}
              </div>
              <button className="menu-cta" onClick={startOrder}>Log in to customize <ArrowRight size={14} /></button>
            </article>
          ))}
        </div>
      </section>

      <footer className="landing-footer">
        <div><div className="footer-brand"><span className="brand-mark"><Pizza size={20} /></span><strong>Crust &amp; Craft</strong></div><p>Handcrafted layers. Live-tracked journeys. Your signature slice.</p></div>
        <div className="footer-links"><a href="#menu">Explore menu</a><button onClick={startOrder}>Start an order</button></div>
        <small>Admin and customer demo access available via Login.</small>
      </footer>
    </main>
  )
}
