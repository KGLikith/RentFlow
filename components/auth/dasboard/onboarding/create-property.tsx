'use client'

import { PropertyForm } from '@/components/forms/property-form'

export default function CreateProperty({ onDone }: { onDone: () => void }) {
  return <PropertyForm onSuccess={onDone} />
}