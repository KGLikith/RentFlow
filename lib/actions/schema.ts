import { z } from 'zod'

export const RoomSchema = z.object({
  roomNumber: z.string().min(1, 'Room number required'),
  capacity: z.number().min(1, 'Capacity must be at least 1'),
})

export const BulkRoomRangeSchema = z.object({
  propertyId: z.string(),
  startRoomNumber: z.number().min(1),
  endRoomNumber: z.number().min(1),
  capacity: z.number().min(1),
})

export const BulkRoomPatternSchema = z.object({
  propertyId: z.string(),
  floorNumber: z.number().min(1),
  roomsPerFloor: z.number().min(1),
  capacity: z.number().min(1),
})

export interface BulkRoomPreview {
  roomNumber: string
  capacity: number
  isValid: boolean
  error?: string
}

export interface BulkRoomResult {
  total: number
  success: number
  failed: number
  details: {
    created: Array<{ id: string; roomNumber: string }>
    errors: Array<{ roomNumber: string; error: string }>
  }
}


export const TenantBulkSchema = z.object({
  name: z.string().min(1, 'Name required'),
  phone: z.string().optional(),
  email: z.string().email('Invalid email').optional(),
  roomId: z.string(),
  rent: z.number().min(0, 'Rent must be positive'),
  deposit: z.number().min(0, 'Deposit must be positive'),
})

export interface TenantBulkPreview {
  rowIndex: number
  name: string
  phone?: string
  email?: string
  roomId: string
  rent: number
  deposit: number
  isValid: boolean
  error?: string
  warnings?: string[]
}

export interface TenantBulkResult {
  total: number
  success: number
  failed: number
  details: {
    created: Array<{ id: string; name: string; roomId: string }>
    errors: Array<{ rowIndex: number; name: string; error: string }>
  }
}