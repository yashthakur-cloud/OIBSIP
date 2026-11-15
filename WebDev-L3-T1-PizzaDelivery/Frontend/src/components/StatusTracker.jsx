import { CheckCircle, ChefHat, Truck } from 'lucide-react'

const stages = [
  { label: 'Order Received', icon: CheckCircle },
  { label: 'In Kitchen', icon: ChefHat },
  { label: 'Sent to Delivery', icon: Truck },
]

export default function StatusTracker({ status }) {
  const activeIndex = stages.findIndex((stage) => stage.label === status)
  return (
    <div className="status-tracker">
      {stages.map(({ label, icon: Icon }, index) => (
        <div className={`status-stage ${index <= activeIndex ? 'active' : ''}`} key={label}>
          <Icon size={22} />
          <span>{label}</span>
        </div>
      ))}
    </div>
  )
}
