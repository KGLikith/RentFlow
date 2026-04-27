'use client'

import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Search } from 'lucide-react'

// Fix leaflet default marker icon (common Next.js issue)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

interface AddressData {
  address: string
  city: string
  state: string
  postalCode: string
  country: string
}

interface MapPickerProps {
  initialCoords: { lat: number; lng: number } | null
  onCoordChange: (coords: { lat: number; lng: number }) => void
  onAddressSelect?: (address: AddressData) => void
}

export default function MapPicker({ initialCoords, onCoordChange, onAddressSelect }: MapPickerProps) {
  const mapRef = useRef<L.Map | null>(null)
  const markerRef = useRef<L.Marker | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)

  const reverseGeocode = async (lat: number, lng: number) => {
    if (!onAddressSelect) return
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
      const data = await res.json()
      if (data && data.address) {
        const addr = data.address
        const street = addr.road || addr.suburb || addr.neighbourhood || ''
        const city = addr.city || addr.town || addr.village || addr.county || ''
        const state = addr.state || ''
        const postalCode = addr.postcode || ''
        const country = addr.country || 'India'

        onAddressSelect({
          address: street,
          city,
          state,
          postalCode,
          country
        })
      }
    } catch (e) {
      console.error('Reverse geocoding failed', e)
    }
  }

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!searchQuery.trim()) return
    
    setIsSearching(true)
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`)
      const data = await res.json()
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat)
        const lng = parseFloat(data[0].lon)
        
        onCoordChange({ lat, lng })
        reverseGeocode(lat, lng)

        if (mapRef.current) {
          mapRef.current.setView([lat, lng], 15)
        }
      }
    } catch (e) {
      console.error('Geocoding search failed', e)
    } finally {
      setIsSearching(false)
    }
  }

  const updateMarker = (lat: number, lng: number, doReverseGeocode = true) => {
    onCoordChange({ lat, lng })
    if (doReverseGeocode) {
      reverseGeocode(lat, lng)
    }
    
    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng])
    } else if (mapRef.current) {
      const marker = L.marker([lat, lng], { draggable: true }).addTo(mapRef.current)
      marker.on('dragend', () => {
        const pos = marker.getLatLng()
        updateMarker(pos.lat, pos.lng)
      })
      markerRef.current = marker
    }
  }

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const defaultCenter: [number, number] = initialCoords
      ? [initialCoords.lat, initialCoords.lng]
      : [12.9716, 77.5946] // Bangalore default

    const map = L.map(containerRef.current, {
      center: defaultCenter,
      zoom: initialCoords ? 15 : 12,
      zoomControl: true,
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(map)

    if (initialCoords) {
      const marker = L.marker([initialCoords.lat, initialCoords.lng], { draggable: true }).addTo(map)
      marker.on('dragend', () => {
        const pos = marker.getLatLng()
        updateMarker(pos.lat, pos.lng)
      })
      markerRef.current = marker
    }

    map.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng
      updateMarker(lat, lng)
    })

    mapRef.current = map
    return () => {
      map.remove()
      mapRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // If parent updates coords externally (not from our own drag), pan the map
  useEffect(() => {
    if (!mapRef.current || !initialCoords) return
    // Don't reverse geocode here to avoid infinite loops if the parent passed the coords
    mapRef.current.setView([initialCoords.lat, initialCoords.lng], 15)
    
    if (markerRef.current) {
      markerRef.current.setLatLng([initialCoords.lat, initialCoords.lng])
    } else {
      const marker = L.marker([initialCoords.lat, initialCoords.lng], { draggable: true }).addTo(mapRef.current)
      marker.on('dragend', () => {
        const pos = marker.getLatLng()
        updateMarker(pos.lat, pos.lng)
      })
      markerRef.current = marker
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialCoords?.lat, initialCoords?.lng]) // Only react to coord changes

  return (
    <div className="relative h-full w-full">
      <div className="absolute top-2 left-12 right-2 z-400 bg-white rounded-lg shadow-md flex items-center px-3 py-1">
        <div className="flex-1 flex items-center">
          <Search className="h-4 w-4 text-gray-400 mr-2 shrink-0" />
          <input 
            type="text" 
            placeholder="Search map location..." 
            className="flex-1 h-8 text-sm outline-none bg-transparent min-w-0"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleSearch()
              }
            }}
          />
          <button 
            type="button" 
            onClick={() => handleSearch()}
            disabled={isSearching}
            className="text-xs text-[#f97316] font-medium ml-2 px-2 py-1 hover:bg-orange-50 rounded shrink-0"
          >
            {isSearching ? '...' : 'Search'}
          </button>
        </div>
      </div>
      <div ref={containerRef} style={{ height: '100%', width: '100%' }} className="z-1" />
    </div>
  )
}
