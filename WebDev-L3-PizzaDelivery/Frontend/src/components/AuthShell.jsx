import { ChefHat, Clock3, LockKeyhole, Pizza } from 'lucide-react'

export default function AuthShell({ eyebrow, title, description, children }) {
  return (
    <div className="auth-page">
      <div className="auth-shell">
        <aside className="auth-showcase">
          <div className="brand-lockup"><span className="brand-mark"><Pizza size={22} /></span><span className="brand">Crust &amp; Craft</span></div>
          <div className="showcase-pizza"><Pizza size={82} strokeWidth={1.2} /></div>
          <span className="eyebrow" style={{ color: '#fbbf24' }}>Artisanal pizza, modern delivery</span>
          <h1>Hand-stretched dough, custom toppings, tracked live.</h1>
          <p className="showcase-copy">From our oven to your doorstep, every slice is made for your kind of craving.</p>
          <div className="showcase-features">
            <div className="showcase-feature"><span className="feature-icon"><ChefHat size={16} /></span>Build your signature pizza</div>
            <div className="showcase-feature"><span className="feature-icon"><Clock3 size={16} /></span>Follow every kitchen milestone</div>
            <div className="showcase-feature"><span className="feature-icon"><LockKeyhole size={16} /></span>Secure, test-mode checkout</div>
          </div>
        </aside>
        <section className="auth-form-panel">
          <div className="auth-card">
            <span className="eyebrow">{eyebrow}</span>
            <h1>{title}</h1>
            {description && <p className="muted" style={{ fontSize: '.82rem', lineHeight: 1.5, marginBottom: '24px' }}>{description}</p>}
            {children}
          </div>
        </section>
      </div>
    </div>
  )
}
