/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  BedDouble, ChevronRight, ChevronDown, Layers, 
  Pencil, Check, IndianRupee, LayoutGrid, AlignLeft,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { ROOM_TYPES } from '@/lib/validations'

export interface RoomItem {
  id: string
  roomNumber: string
  capacity: number
  roomType?: string
  currentRent?: any
  floorNumber?: number | null
  amenities?: string | null
}

interface Props {
  rooms: RoomItem[]
  propertyId: string
  totalFloors?: number
  readonly?: boolean
  onBulkUpdate: (roomIds: string[], updates: Record<string, any>) => Promise<void>
}

/** Split "A101" → ["A", 101], "102" → ["", 102] */
function splitRoomNum(n: string): [string, number] {
  const m = n.match(/^([A-Za-z]*)(\d+)$/)
  return m ? [m[1].toUpperCase(), parseInt(m[2], 10)] : [n.toUpperCase(), 0]
}

function sortRooms(rooms: RoomItem[]) {
  return [...rooms].sort((a, b) => {
    const [pa, na] = splitRoomNum(a.roomNumber)
    const [pb, nb] = splitRoomNum(b.roomNumber)
    if (pa !== pb) return pa.localeCompare(pb)
    return na - nb
  })
}

function groupByFloor(rooms: RoomItem[]): Map<string, RoomItem[]> {
  const map = new Map<string, RoomItem[]>()
  for (const r of sortRooms(rooms)) {
    const key =
      r.floorNumber === null || r.floorNumber === undefined
        ? 'unassigned'
        : r.floorNumber === 0
          ? 'ground'
          : String(r.floorNumber)
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(r)
  }
  return map
}

function floorLabel(key: string) {
  if (key === 'ground') return 'Ground Floor'
  if (key === 'unassigned') return 'Unassigned'
  const n = parseInt(key)
  if (n < 0) return `Basement ${Math.abs(n)}`
  const suffix = n === 1 ? 'st' : n === 2 ? 'nd' : n === 3 ? 'rd' : 'th'
  return `${n}${suffix} Floor`
}

const inputClass = 'h-9 rounded-lg border border-[#e5e7eb] dark:border-gray-800 bg-white dark:bg-gray-950 px-3 text-[13px] font-medium placeholder:text-gray-400 focus-visible:ring-2 focus-visible:ring-[#f97316]/20 focus-visible:border-[#f97316] w-full transition-all outline-none'

export function FloorRoomView({ rooms, propertyId, totalFloors = 1, readonly = false, onBulkUpdate }: Props) {
  const [collapsedFloors, setCollapsedFloors] = useState<Set<string>>(new Set())
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [bulkEditOpen, setBulkEditOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [bulkFields, setBulkFields] = useState({
    roomType: '', currentRent: '', floorNumber: '', amenities: '', description: '',
  })

  const grouped = groupByFloor(rooms)
  const floorOrder = [...grouped.keys()].sort((a, b) => {
    if (a === 'ground') return -1
    if (b === 'ground') return 1
    if (a === 'unassigned') return 1
    if (b === 'unassigned') return -1
    return parseInt(a) - parseInt(b)
  })

  const toggleFloor = (key: string) => {
    setCollapsedFloors(prev => {
      const next = new Set(prev)
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })
  }

  const toggleRoom = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const toggleFloorRooms = (keys: RoomItem[]) => {
    const allSelected = keys.every(r => selectedIds.has(r.id))
    setSelectedIds(prev => {
      const next = new Set(prev)
      keys.forEach(r => allSelected ? next.delete(r.id) : next.add(r.id))
      return next
    })
  }

  const handleBulkSave = async () => {
    if (selectedIds.size === 0) return
    setSaving(true)
    const updates: Record<string, any> = {}
    if (bulkFields.roomType)   updates.roomType    = bulkFields.roomType
    if (bulkFields.currentRent) updates.currentRent = parseFloat(bulkFields.currentRent)
    if (bulkFields.floorNumber !== '') updates.floorNumber = parseInt(bulkFields.floorNumber)
    if (bulkFields.amenities)  updates.amenities   = bulkFields.amenities
    if (bulkFields.description) updates.description = bulkFields.description
    try {
      await onBulkUpdate([...selectedIds], updates)
      setBulkEditOpen(false)
      setSelectedIds(new Set())
      setBulkFields({ roomType: '', currentRent: '', floorNumber: '', amenities: '', description: '' })
    } finally {
      setSaving(false)
    }
  }

  if (rooms.length === 0) {
    return (
      <div className="py-12 text-center flex flex-col items-center">
        <div className="h-14 w-14 rounded-full bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center mb-3">
          <BedDouble className="h-6 w-6 text-[#f97316]/50" />
        </div>
        <p className="font-semibold text-gray-900 dark:text-white">No rooms added yet</p>
        <p className="text-sm text-muted-foreground mt-1">Click the + icon above to add your first room.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Bulk Action Panel */}
      {selectedIds.size > 0 && !readonly && !bulkEditOpen && (
        <div className="flex items-center justify-between px-4 py-2.5 bg-[#fff7ed] dark:bg-orange-950/20 border border-[#f97316]/20 rounded-2xl">
          <span className="text-sm font-semibold text-[#f97316]">{selectedIds.size} room{selectedIds.size > 1 ? 's' : ''} selected</span>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="h-8 rounded-full text-xs" onClick={() => setSelectedIds(new Set())}>
              Clear
            </Button>
            <Button size="sm" className="h-8 rounded-full text-xs bg-[#f97316] hover:bg-[#ea580c] text-white" onClick={() => setBulkEditOpen(true)}>
              <Pencil className="h-3 w-3 mr-1" /> Bulk Edit
            </Button>
          </div>
        </div>
      )}

      {/* Bulk edit panel */}
      {bulkEditOpen && (
        <div className="p-4 bg-white dark:bg-gray-950 border border-[#f97316]/20 rounded-2xl shadow-sm space-y-3">
          <div className="flex items-center justify-between mb-1">
            <p className="text-[13px] font-semibold text-gray-900 dark:text-white">
              Editing {selectedIds.size} rooms — only filled fields will be updated
            </p>
            <Button size="sm" variant="ghost" className="h-7 text-xs rounded-full" onClick={() => setBulkEditOpen(false)}>Cancel</Button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-[12px] font-medium text-gray-600 dark:text-gray-400">Room Type</Label>
              <Select value={bulkFields.roomType} onValueChange={v => setBulkFields(p => ({ ...p, roomType: v }))}>
                <SelectTrigger className={inputClass}><SelectValue placeholder="Keep current" /></SelectTrigger>
                <SelectContent>{ROOM_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-[12px] font-medium text-gray-600 dark:text-gray-400">
                <IndianRupee className="h-3 w-3 inline-block mr-0.5 -mt-0.5" /> Monthly Rent
              </Label>
              <Input type="number" placeholder="Keep current" className={inputClass}
                value={bulkFields.currentRent} onChange={e => setBulkFields(p => ({ ...p, currentRent: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label className="text-[12px] font-medium text-gray-600 dark:text-gray-400">Floor Number</Label>
              <Select value={bulkFields.floorNumber} onValueChange={v => setBulkFields(p => ({ ...p, floorNumber: v }))}>
                <SelectTrigger className={inputClass}><SelectValue placeholder="Keep current" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Ground Floor (0)</SelectItem>
                  {Array.from({ length: totalFloors }).map((_, i) => (
                    <SelectItem key={i + 1} value={(i + 1).toString()}>Floor {i + 1}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-[12px] font-medium text-gray-600 dark:text-gray-400">
                <LayoutGrid className="h-3 w-3 inline-block mr-0.5 -mt-0.5" /> Amenities
              </Label>
              <Input placeholder="Keep current" className={inputClass}
                value={bulkFields.amenities} onChange={e => setBulkFields(p => ({ ...p, amenities: e.target.value }))} />
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-[12px] font-medium text-gray-600 dark:text-gray-400">
              <AlignLeft className="h-3 w-3 inline-block mr-0.5 -mt-0.5" /> Description
            </Label>
            <Textarea placeholder="Keep current" className="rounded-lg border border-[#e5e7eb] dark:border-gray-800 bg-white dark:bg-gray-950 px-3 py-2 text-[13px] placeholder:text-gray-400 focus-visible:ring-2 focus-visible:ring-[#f97316]/20 focus-visible:border-[#f97316] w-full resize-none outline-none min-h-[60px]"
              value={bulkFields.description} onChange={e => setBulkFields(p => ({ ...p, description: e.target.value }))} />
          </div>
          <Button onClick={handleBulkSave} disabled={saving} className="w-full h-10 rounded-full bg-[#f97316] hover:bg-[#ea580c] text-white font-semibold text-sm">
            {saving ? 'Saving…' : `Apply to ${selectedIds.size} Rooms`}
          </Button>
        </div>
      )}

      {/* Floor sections */}
      {floorOrder.map(floorKey => {
        const floorRooms = grouped.get(floorKey)!
        const isCollapsed = collapsedFloors.has(floorKey)
        const isAllSelected = floorRooms.every(r => selectedIds.has(r.id))

        return (
          <div key={floorKey} className="rounded-2xl border border-gray-100 dark:border-gray-800/60 overflow-hidden">
            {/* Floor header */}
            <div className="flex items-center justify-between px-4 py-3 bg-gray-50/80 dark:bg-gray-900/50">
              <div className="flex items-center gap-3">
                {!readonly && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleFloorRooms(floorRooms)
                    }}
                    className={`h-5 w-5 rounded border flex items-center justify-center transition-all ${isAllSelected ? 'bg-[#f97316] border-[#f97316]' : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'}`}
                  >
                    {isAllSelected && <Check className="h-3 w-3 text-white" />}
                  </button>
                )}
                <div className="flex items-center gap-2">
                  <Layers className="h-4 w-4 text-[#f97316]" />
                  <span className="font-semibold text-gray-900 dark:text-white text-sm">{floorLabel(floorKey)}</span>
                  <span className="text-xs text-muted-foreground bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-2 py-0.5 rounded-full">
                    {floorRooms.length} room{floorRooms.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
              <button type="button" onClick={() => toggleFloor(floorKey)} className="text-muted-foreground hover:text-foreground transition-colors p-1">
                <ChevronDown className={`h-4 w-4 transition-transform ${isCollapsed ? '-rotate-90' : ''}`} />
              </button>
            </div>

            {/* Rooms grid with per-floor scroll */}
            {!isCollapsed && (
              <div className="max-h-[400px] overflow-y-auto custom-scrollbar p-3 bg-white dark:bg-gray-950/30">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {floorRooms.map(room => {
                  const checked = selectedIds.has(room.id)
                  return (
                    <div key={room.id} className="relative group">
                      {/* Selection checkbox */}
                      {!readonly && (
                        <button
                          type="button"
                          onClick={() => toggleRoom(room.id)}
                          className={`absolute top-2 left-2 z-10 h-4 w-4 rounded border flex items-center justify-center transition-all ${checked ? 'bg-[#f97316] border-[#f97316] opacity-100' : 'border-gray-300 dark:border-gray-600 opacity-0 group-hover:opacity-100'}`}
                        >
                          {checked && <Check className="h-2.5 w-2.5 text-white" />}
                        </button>
                      )}

                      <Link href={`/dashboard/properties/${propertyId}/rooms/${room.id}`}>
                        <div className={`p-3 rounded-xl border transition-all cursor-pointer ${checked ? 'border-[#f97316]/40 bg-orange-50/60 dark:bg-orange-950/20' : 'border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/30 hover:border-[#f97316]/30 hover:bg-orange-50/40'}`}>
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="h-7 w-7 rounded-lg bg-white dark:bg-gray-800 shadow-xs flex items-center justify-center">
                              <BedDouble className="h-3.5 w-3.5 text-[#f97316]" />
                            </div>
                            <ChevronRight className="h-3.5 w-3.5 text-gray-300 group-hover:text-[#f97316] transition-colors" />
                          </div>
                          <p className="text-[13px] font-bold text-gray-900 dark:text-white truncate">
                            {room.roomNumber}
                          </p>
                          <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                            {room.roomType || 'Room'}
                          </p>
                        </div>
                      </Link>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
          </div>
        )
      })}
    </div>
  )
}
