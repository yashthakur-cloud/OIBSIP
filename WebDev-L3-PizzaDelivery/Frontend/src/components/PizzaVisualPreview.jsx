const sauceColors = {
  marinara: '#d92323',
  alfredo: '#fef3c7',
  pesto: '#65a30d',
  bbq: '#78350f',
  default: '#ef4444',
}

function getSauceColor(sauce) {
  if (!sauce) return sauceColors.default
  const name = sauce.name.toLowerCase()
  if (name.includes('alfredo')) return sauceColors.alfredo
  if (name.includes('pesto')) return sauceColors.pesto
  if (name.includes('bbq')) return sauceColors.bbq
  return sauceColors.marinara
}

function toppingColor(name) {
  const lower = name.toLowerCase()
  if (lower.includes('mushroom')) return '#c4a484'
  if (lower.includes('olive')) return '#292524'
  if (lower.includes('jalapeno')) return '#65a30d'
  if (lower.includes('corn')) return '#fbbf24'
  if (lower.includes('onion')) return '#c084fc'
  return '#16a34a'
}

export default function PizzaVisualPreview({ base, sauce, cheese, veggies }) {
  const crustTone = base?.name.toLowerCase().includes('whole') ? '#a16207' : base?.name.toLowerCase().includes('gluten') ? '#d6a86a' : '#c2410c'
  return (
    <svg className="pizza-svg" viewBox="0 0 240 240" role="img" aria-label="Live pizza preview">
      <circle cx="120" cy="120" r="104" fill="#d6d3d1" opacity=".22" />
      <circle cx="120" cy="120" r="92" fill={crustTone} />
      <circle cx="120" cy="120" r="76" fill={getSauceColor(sauce)} />
      <circle cx="120" cy="120" r="69" fill="#fef3c7" opacity=".9" />
      <circle cx="120" cy="120" r="64" fill={getSauceColor(sauce)} opacity=".88" />
      {cheese && [35, 75, 120, 165, 205].map((x, index) => <circle key={`cheese-${x}`} cx={x} cy={95 + (index % 2) * 38} r="5" fill="#fde68a" opacity=".9" />)}
      {(veggies || []).map((veggie, index) => {
        const angle = (index / Math.max(veggies.length, 1)) * Math.PI * 2
        const x = 120 + Math.cos(angle) * (28 + (index % 2) * 24)
        const y = 120 + Math.sin(angle) * (28 + (index % 2) * 24)
        return <circle key={veggie._id} cx={x} cy={y} r={veggie.name.toLowerCase().includes('mushroom') ? 8 : 6} fill={toppingColor(veggie.name)} stroke="#fff" strokeWidth="2" />
      })}
      <circle cx="91" cy="80" r="4" fill="white" opacity=".45" />
      <circle cx="158" cy="157" r="3" fill="white" opacity=".35" />
    </svg>
  )
}
