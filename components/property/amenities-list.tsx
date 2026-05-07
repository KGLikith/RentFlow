import { CheckCircle2 } from 'lucide-react'

interface AmenitiesListProps {
  amenitiesStr?: string | null
  className?: string
}

export function AmenitiesList({ amenitiesStr, className = '' }: AmenitiesListProps) {
  if (!amenitiesStr) return null

  // Split by comma, trim whitespace, and filter out empty strings
  const amenities = amenitiesStr
    .split(',')
    .map((a) => a.trim())
    .filter((a) => a.length > 0)

  if (amenities.length === 0) return null

  return (
    <div className={`space-y-2 ${className}`}>
      <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Amenities Provided</h4>
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {amenities.map((amenity, idx) => (
          <li key={idx} className="flex items-start gap-2.5">
            <CheckCircle2 className="h-4 w-4 text-[#f97316] shrink-0 mt-0.5" />
            <span className="text-sm text-gray-700 dark:text-gray-300 leading-tight">
              {amenity}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
