import { Bike, CheckCircle2, ChefHat } from 'lucide-react'

const stages = [
  { label: 'Order Received', icon: CheckCircle2 },
  { label: 'In Kitchen', icon: ChefHat },
  { label: 'Sent to Delivery', icon: Bike },
]

export default function StatusTracker({ status }) {
  const activeIndex = stages.findIndex((stage) => stage.label === status)
  return (
    <div>
      <span className="live-badge"><span className="live-dot" /> Live Kitchen Sync</span>
      <div className="status-tracker">
      <span className="status-fill" style={{ width: `${Math.max(0, activeIndex) * 36}%` }} />
      {stages.map(({ label, icon: Icon }, index) => (
        <div className={`status-stage ${index < activeIndex ? 'complete' : ''} ${index === activeIndex ? 'current' : ''}`} key={label}>
          <span className="status-stage-icon"><Icon size={19} /></span>
          <span>{label}</span>
        </div>
      ))}
      </div>
    </div>
  )
}
