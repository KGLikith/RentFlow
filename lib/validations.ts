import { z } from 'zod'

export const propertySchema = z.object({
  name: z.string().min(1, 'Property name is required'),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  postalCode: z.string().optional(),
  country: z.string().optional().default('India'),
  totalRooms: z.number().int().positive('Total rooms must be positive').default(1),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
})

export type PropertyInput = z.infer<typeof propertySchema>

export const roomSchema = z.object({
  roomNumber: z.string().min(1, 'Room number is required'),
  roomType: z.string().min(1, 'Room type is required'),
  carpetArea: z.number().positive().optional(),
  builtUpArea: z.number().positive().optional(),
  floorNumber: z.number().int().optional(),
  amenities: z.string().optional(),
  currentRent: z.number().positive('Rent must be positive'),
  description: z.string().optional(),
})

export type RoomInput = z.infer<typeof roomSchema>

export const tenantSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Valid email is required').optional().or(z.literal('')),
  phone: z.string().min(10, 'Valid phone number is required').optional().or(z.literal('')),
  aadharNumber: z.string().optional(),
  panNumber: z.string().optional(),
  dateOfBirth: z.date().optional(),
  emergencyContact: z.string().optional(),
  emergencyPhone: z.string().optional(),
  occupationDetails: z.string().optional(),
  companyName: z.string().optional(),
}).refine((data) => data.email || data.phone, {
  message: 'Either email or phone is required',
  path: ['email'],
})

export type TenantInput = z.infer<typeof tenantSchema>

export const leaseSchema = z.object({
  startDate: z.date(),
  endDate: z.date(),
  depositAmount: z.number().positive('Deposit must be positive'),
  rentAmount: z.number().positive('Rent must be positive'),
  incrementPercentage: z.number().nonnegative().optional(),
  leaseDocumentUrl: z.string().optional(),
  maintenanceCharges: z.number().nonnegative().default(0),
  waterCharges: z.number().nonnegative().default(0),
  otherCharges: z.number().nonnegative().default(0),
  dueDate: z.number().int().min(1).max(31).default(1),
}).refine(
  (data) => data.endDate > data.startDate,
  {
    message: 'End date must be after start date',
    path: ['endDate'],
  }
)

export type LeaseInput = z.infer<typeof leaseSchema>

export const invoiceSchema = z.object({
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2000),
  rentAmount: z.number().positive(),
  maintenanceCharges: z.number().nonnegative().default(0),
  waterCharges: z.number().nonnegative().default(0),
  otherCharges: z.number().nonnegative().default(0),
  dueDate: z.date(),
  notes: z.string().optional(),
})

export type InvoiceInput = z.infer<typeof invoiceSchema>

export const paymentSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  paymentMethod: z.enum(['upi', 'bank_transfer', 'cash', 'check']),
  transactionId: z.string().optional(),
  upiId: z.string().optional(),
  notes: z.string().optional(),
  proofDocumentUrl: z.string().optional(),
})

export type PaymentInput = z.infer<typeof paymentSchema>

export const announcementSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
  priority: z.enum(['low', 'normal', 'high']).default('normal'),
  expiryDate: z.date().optional(),
})

export type AnnouncementInput = z.infer<typeof announcementSchema>
