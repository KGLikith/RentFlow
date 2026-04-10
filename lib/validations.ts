import { z } from 'zod'

export const propertySchema = z.object({
  name: z.string().min(1, 'Property name is required'),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  postalCode: z.string().min(1, 'Postal code is required'),
  country: z.string().min(1, 'Country is required'),
  propertyType: z.string().min(1, 'Property type is required'),
  totalRooms: z.number().int().positive('Total rooms must be positive'),
  description: z.string().optional(),
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
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Valid email is required'),
  phoneNumber: z.string().min(10, 'Valid phone number is required'),
  aadharNumber: z.string().optional(),
  panNumber: z.string().optional(),
  dateOfBirth: z.date().optional(),
  emergencyContact: z.string().optional(),
  emergencyPhone: z.string().optional(),
  occupationDetails: z.string().optional(),
  companyName: z.string().optional(),
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
