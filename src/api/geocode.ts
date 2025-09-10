// src/api/geocode.ts
export async function geocode(query: string): Promise<{ lat: number; lon: number; label: string } | null> {
  const url = new URL('https://nominatim.openstreetmap.org/search')
  url.searchParams.set('q', query)
  url.searchParams.set('format', 'json')
  url.searchParams.set('limit', '1')


  const res = await fetch(url.toString(), {
    headers: { 'User-Agent': 'weather-widget/1.0 (contact: you@example.com)' }
  })

  if (!res.ok) return null
  const data = await res.json()
  if (!Array.isArray(data) || data.length === 0) return null

  const place = data[0]
  return {
    lat: parseFloat(place.lat),
    lon: parseFloat(place.lon),
    label: place.display_name
  }
}
