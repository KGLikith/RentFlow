export async function geocodeAddress(address: string, city: string, state: string, postalCode?: string, country?: string) {
  try {
    const fullAddress = [address, city, state, postalCode, country || 'India'].filter(Boolean).join(', ')
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullAddress)}&limit=1`
    const res = await fetch(url, { headers: { 'User-Agent': 'RentDashboard/1.0' } })
    if (!res.ok) return null
    const data = await res.json()
    if (data.length === 0) return null
    return { latitude: parseFloat(data[0].lat), longitude: parseFloat(data[0].lon) }
  } catch {
    return null
  }
}
