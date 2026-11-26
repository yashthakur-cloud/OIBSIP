export default function DeliveryAddress({ value }) {
  const address = value || ''
  const locationMatch = address.match(/\n?Location coordinates: (-?\d+(?:\.\d+)?), (-?\d+(?:\.\d+)?)$/)
  const streetAddress = locationMatch
    ? address.slice(0, locationMatch.index).trim()
    : address
  const mapUrl = locationMatch
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${locationMatch[1]},${locationMatch[2]}`)}`
    : null

  return (
    <>
      {streetAddress || 'Current location'}
      {mapUrl && <> · <a className="text-link" href={mapUrl} target="_blank" rel="noreferrer">View on Google Maps</a></>}
    </>
  )
}
