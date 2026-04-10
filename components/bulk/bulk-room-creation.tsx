'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import {
  generateRangeRoomPreview,
  generatePatternRoomPreview,
  parseCSVRooms,
  bulkCreateRoomsByRange,
  bulkCreateRoomsByPattern,
  bulkCreateRoomsFromCSV,
} from '@/lib/actions/room'
import { BulkRoomPreview, BulkRoomResult } from '@/lib/actions/schema'

interface BulkRoomCreationProps {
  propertyId: string
  onSuccess?: (result: BulkRoomResult) => void
}

export function BulkRoomCreation({ propertyId, onSuccess }: BulkRoomCreationProps) {
  const [activeTab, setActiveTab] = useState('range')
  const [loading, setLoading] = useState(false)

  const [rangeStart, setRangeStart] = useState('')
  const [rangeEnd, setRangeEnd] = useState('')
  const [rangeCapacity, setRangeCapacity] = useState('')
  const [rangePreview, setRangePreview] = useState<BulkRoomPreview[]>([])

  const [floorNumber, setFloorNumber] = useState('')
  const [roomsPerFloor, setRoomsPerFloor] = useState('')
  const [patternCapacity, setPatternCapacity] = useState('')
  const [patternPreview, setPatternPreview] = useState<BulkRoomPreview[]>([])

  const [csvContent, setCSVContent] = useState('')
  const [csvPreview, setCSVPreview] = useState<BulkRoomPreview[]>([])

  const [result, setResult] = useState<BulkRoomResult | null>(null)

  const handleRangePreview = () => {
    const start = parseInt(rangeStart, 10)
    const end = parseInt(rangeEnd, 10)
    const capacity = parseInt(rangeCapacity, 10)

    if (!start || !end || !capacity) {
      toast.error('Please fill all fields')
      return
    }

    const preview = generateRangeRoomPreview(start, end, capacity)
    setRangePreview(preview)
  }

  const handleRangeSubmit = async () => {
    if (!rangePreview.length) {
      toast.error('Generate preview first')
      return
    }

    setLoading(true)
    try {
      const start = parseInt(rangeStart, 10)
      const end = parseInt(rangeEnd, 10)
      const capacity = parseInt(rangeCapacity, 10)

      const bulkResult = await bulkCreateRoomsByRange(
        propertyId,
        start,
        end,
        capacity
      )

      setResult(bulkResult)
      toast.success('Rooms created', {
        description: `${bulkResult.success} rooms created, ${bulkResult.failed} failed`,
      })

      if (onSuccess) {
        onSuccess(bulkResult)
      }
    } catch (error) {
      toast.error('Error', {
        description: error instanceof Error ? error.message : 'Failed to create rooms',
      })
    } finally {
      setLoading(false)
    }
  }

  const handlePatternPreview = () => {
    const floor = parseInt(floorNumber, 10)
    const rooms = parseInt(roomsPerFloor, 10)
    const capacity = parseInt(patternCapacity, 10)

    if (!floor || !rooms || !capacity) {
      toast.error('Please fill all fields')
      return
    }

    const preview = generatePatternRoomPreview(floor, rooms, capacity)
    setPatternPreview(preview)
  }

  const handlePatternSubmit = async () => {
    if (!patternPreview.length) {
      toast.error('Generate preview first')
      return
    }

    setLoading(true)
    try {
      const floor = parseInt(floorNumber, 10)
      const rooms = parseInt(roomsPerFloor, 10)
      const capacity = parseInt(patternCapacity, 10)

      const bulkResult = await bulkCreateRoomsByPattern(
        propertyId,
        floor,
        rooms,
        capacity
      )

      setResult(bulkResult)
      toast.success('Rooms created', {
        description: `${bulkResult.success} rooms created, ${bulkResult.failed} failed`,
      })

      if (onSuccess) {
        onSuccess(bulkResult)
      }
    } catch (error) {
      toast.error('Error', {
        description: error instanceof Error ? error.message : 'Failed to create rooms',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCSVPreview = () => {
    if (!csvContent.trim()) {
      toast.error('Please paste CSV content')
      return
    }

    const preview = parseCSVRooms(csvContent)
    setCSVPreview(preview)
  }

  const handleCSVSubmit = async () => {
    if (!csvPreview.length) {
      toast.error('Generate preview first')
      return
    }

    setLoading(true)
    try {
      const bulkResult = await bulkCreateRoomsFromCSV(propertyId, csvContent)
      setResult(bulkResult)
      toast.success('Rooms created', {
        description: `${bulkResult.success} rooms created, ${bulkResult.failed} failed`,
      })

      if (onSuccess) {
        onSuccess(bulkResult)
      }
    } catch (error) {
      toast.error('Error', {
        description: error instanceof Error ? error.message : 'Failed to create rooms',
      })
    } finally {
      setLoading(false)
    }
  }

  if (result) {
    return (
      <Card className="p-6 space-y-4 border-emerald-200 bg-emerald-50 dark:bg-emerald-950">
        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold text-emerald-900 dark:text-emerald-100">
            Bulk Creation Complete
          </h3>
          <p className="text-sm text-emerald-700 dark:text-emerald-300">
            {result.success} rooms created successfully
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2 bg-white dark:bg-black rounded border border-emerald-200">
            <p className="text-xs text-gray-600 dark:text-gray-400">Total</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">{result.total}</p>
          </div>
          <div className="p-2 bg-emerald-100 dark:bg-emerald-900 rounded border border-emerald-300">
            <p className="text-xs text-emerald-700 dark:text-emerald-300">Success</p>
            <p className="text-lg font-bold text-emerald-900 dark:text-emerald-100">{result.success}</p>
          </div>
          <div className="p-2 bg-red-100 dark:bg-red-900 rounded border border-red-300">
            <p className="text-xs text-red-700 dark:text-red-300">Failed</p>
            <p className="text-lg font-bold text-red-900 dark:text-red-100">{result.failed}</p>
          </div>
        </div>

        {result.details.errors.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-red-900 dark:text-red-100">Failed Rooms:</h4>
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {result.details.errors.map((error, i) => (
                <div key={i} className="text-xs p-2 bg-white dark:bg-black rounded border border-red-200">
                  <p className="font-mono text-red-700 dark:text-red-300">{error.roomNumber}</p>
                  <p className="text-gray-600 dark:text-gray-400">{error.error}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <Button
          onClick={() => {
            setResult(null)
            setRangePreview([])
            setPatternPreview([])
            setCSVPreview([])
          }}
          className="w-full"
        >
          Create More Rooms
        </Button>
      </Card>
    )
  }

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="range">Range</TabsTrigger>
        <TabsTrigger value="pattern">Pattern</TabsTrigger>
        <TabsTrigger value="csv">CSV</TabsTrigger>
      </TabsList>

      <TabsContent value="range" className="space-y-4">
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-medium">Start Room #</label>
              <Input
                type="number"
                value={rangeStart}
                onChange={(e) => setRangeStart(e.target.value)}
                placeholder="1"
                min="1"
              />
            </div>
            <div>
              <label className="text-xs font-medium">End Room #</label>
              <Input
                type="number"
                value={rangeEnd}
                onChange={(e) => setRangeEnd(e.target.value)}
                placeholder="10"
                min="1"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium">Capacity per Room</label>
            <Input
              type="number"
              value={rangeCapacity}
              onChange={(e) => setRangeCapacity(e.target.value)}
              placeholder="2"
              min="1"
            />
          </div>

          <Button onClick={handleRangePreview} variant="outline" className="w-full">
            Generate Preview
          </Button>
        </div>

        {rangePreview.length > 0 && (
          <Card className="p-3 border-gray-200">
            <p className="text-xs font-semibold mb-2">
              Preview: {rangePreview.length} rooms
            </p>
            <div className="grid grid-cols-4 gap-1 max-h-40 overflow-y-auto">
              {rangePreview.map((room, i) => (
                <div
                  key={i}
                  className="p-2 bg-gray-50 dark:bg-gray-900 rounded text-center text-xs"
                >
                  <p className="font-mono font-bold">{room.roomNumber}</p>
                  <p className="text-gray-600 dark:text-gray-400">Cap: {room.capacity}</p>
                </div>
              ))}
            </div>
            <Button
              onClick={handleRangeSubmit}
              disabled={loading}
              className="w-full mt-3 bg-emerald-600 hover:bg-emerald-700"
            >
              {loading && <Spinner className="w-4 h-4 mr-2" />}
              Create Rooms
            </Button>
          </Card>
        )}
      </TabsContent>

      <TabsContent value="pattern" className="space-y-4">
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-medium">Floor Number</label>
              <Input
                type="number"
                value={floorNumber}
                onChange={(e) => setFloorNumber(e.target.value)}
                placeholder="1"
                min="1"
              />
            </div>
            <div>
              <label className="text-xs font-medium">Rooms per Floor</label>
              <Input
                type="number"
                value={roomsPerFloor}
                onChange={(e) => setRoomsPerFloor(e.target.value)}
                placeholder="10"
                min="1"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium">Capacity per Room</label>
            <Input
              type="number"
              value={patternCapacity}
              onChange={(e) => setPatternCapacity(e.target.value)}
              placeholder="2"
              min="1"
            />
          </div>

          <Button onClick={handlePatternPreview} variant="outline" className="w-full">
            Generate Preview
          </Button>
        </div>

        {patternPreview.length > 0 && (
          <Card className="p-3 border-gray-200">
            <p className="text-xs font-semibold mb-2">
              Preview: {patternPreview.length} rooms
            </p>
            <div className="grid grid-cols-4 gap-1 max-h-40 overflow-y-auto">
              {patternPreview.map((room, i) => (
                <div
                  key={i}
                  className="p-2 bg-gray-50 dark:bg-gray-900 rounded text-center text-xs"
                >
                  <p className="font-mono font-bold">{room.roomNumber}</p>
                  <p className="text-gray-600 dark:text-gray-400">Cap: {room.capacity}</p>
                </div>
              ))}
            </div>
            <Button
              onClick={handlePatternSubmit}
              disabled={loading}
              className="w-full mt-3 bg-emerald-600 hover:bg-emerald-700"
            >
              {loading && <Spinner className="w-4 h-4 mr-2" />}
              Create Rooms
            </Button>
          </Card>
        )}
      </TabsContent>

      <TabsContent value="csv" className="space-y-4">
        <div className="space-y-3">
          <div className="text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 p-2 rounded">
            <p className="font-mono">roomNumber,capacity</p>
            <p className="font-mono">101,2</p>
            <p className="font-mono">102,3</p>
          </div>

          <textarea
            value={csvContent}
            onChange={(e) => setCSVContent(e.target.value)}
            placeholder="Paste CSV here..."
            className="w-full h-32 p-2 border rounded font-mono text-sm resize-none"
          />

          <Button onClick={handleCSVPreview} variant="outline" className="w-full">
            Preview CSV
          </Button>
        </div>

        {csvPreview.length > 0 && (
          <Card className="p-3 border-gray-200 space-y-2">
            <p className="text-xs font-semibold">
              Preview: {csvPreview.length} rooms
            </p>
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {csvPreview.map((room, i) => (
                <div
                  key={i}
                  className={`p-2 text-xs rounded border ${
                    room.isValid
                      ? 'bg-emerald-50 dark:bg-emerald-950 border-emerald-200'
                      : 'bg-red-50 dark:bg-red-950 border-red-200'
                  }`}
                >
                  <div className="flex justify-between">
                    <span className="font-mono">
                      {room.roomNumber} (Cap: {room.capacity})
                    </span>
                    {room.isValid ? (
                      <span className="text-emerald-600 dark:text-emerald-400">✓</span>
                    ) : (
                      <span className="text-red-600 dark:text-red-400">✗</span>
                    )}
                  </div>
                  {room.error && (
                    <p className="text-red-600 dark:text-red-400 text-xs mt-1">
                      {room.error}
                    </p>
                  )}
                </div>
              ))}
            </div>
            <Button
              onClick={handleCSVSubmit}
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700"
            >
              {loading && <Spinner className="w-4 h-4 mr-2" />}
              Create Rooms
            </Button>
          </Card>
        )}
      </TabsContent>
    </Tabs>
  )
}
