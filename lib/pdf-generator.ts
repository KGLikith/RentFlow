import { jsPDF } from 'jspdf'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'

interface LeaseData {
  email?: string
  roomNumber: string
  rentAmount: number
  deposit: number
  propertyName: string
  startDate?: Date
  endDate?: Date
}

export const generateLeasePDF = (data: LeaseData): Blob => {
  const doc = new jsPDF()
  
  // Header
  doc.setFontSize(22)
  doc.setTextColor(249, 115, 22) // Orange
  doc.text('LEASE AGREEMENT', 105, 20, { align: 'center' })
  
  // Property Info
  doc.setFontSize(14)
  doc.setTextColor(50, 50, 50)
  doc.text(`Property: ${data.propertyName}`, 20, 40)
  doc.text(`Room Number: ${data.roomNumber}`, 20, 50)
  
  // Tenant Info
  doc.text(`Tenant Email: ${data.email || 'Pending Activation'}`, 20, 60)
  
  // Lease Period
  const start = data.startDate ? new Date(data.startDate).toLocaleDateString() : new Date().toLocaleDateString()
  const end = data.endDate ? new Date(data.endDate).toLocaleDateString() : 'Ongoing'
  doc.text(`Lease Period: ${start} to ${end}`, 20, 70)
  
  // Financials
  doc.setFontSize(16)
  doc.setTextColor(16, 185, 129) // Emerald
  doc.text('Financial Details:', 20, 80)
  
  doc.setFontSize(14)
  doc.setTextColor(50, 50, 50)
  doc.text(`Monthly Rent: Rs. ${data.rentAmount.toLocaleString()}`, 20, 90)
  doc.text(`Security Deposit: Rs. ${data.deposit.toLocaleString()}`, 20, 100)
  
  // Terms
  doc.setFontSize(16)
  doc.text('Terms & Conditions:', 20, 120)
  doc.setFontSize(12)
  doc.setTextColor(80, 80, 80)
  const terms = [
    '1. Rent is due on the 1st of every month.',
    '2. The security deposit is refundable upon termination, subject to damages.',
    '3. Subletting the room is strictly prohibited.',
    '4. A 30-day notice is required before vacating the premises.',
  ]
  
  let y = 130
  terms.forEach(term => {
    doc.text(term, 20, y)
    y += 10
  })
  
  // Signatures
  doc.setFontSize(14)
  doc.setTextColor(50, 50, 50)
  doc.text('_______________________', 20, 200)
  doc.text('Landlord Signature', 20, 210)
  
  doc.text('_______________________', 120, 200)
  doc.text('Tenant Signature', 120, 210)

  // Output as Blob
  return doc.output('blob')
}

export const generateBulkLeasesZip = async (leases: LeaseData[]) => {
  const zip = new JSZip()
  
  leases.forEach((lease, index) => {
    const pdfBlob = generateLeasePDF(lease)
    const filename = `Lease_Room_${lease.roomNumber}_${lease.email || `Tenant_${index+1}`}.pdf`
    zip.file(filename, pdfBlob)
  })
  
  const content = await zip.generateAsync({ type: 'blob' })
  saveAs(content, 'Lease_Agreements.zip')
}
