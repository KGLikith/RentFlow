import { InvoiceStatus, PaymentMethod, PaymentStatus, TenantStatus } from '@/app/generated/prisma/enums'
import { prisma } from './prisma'
import { Decimal } from '@prisma/client/runtime/library'

export async function generateMonthlyInvoices(
  propertyId: string,
  month: number,
  year: number
) {
  try {
    const leases = await prisma.lease.findMany({
      where: {
        propertyId,
        isActive: true,
        startDate: {
          lte: new Date(year, month - 1, 1)
        },
        endDate: {
          gte: new Date(year, month, 0)
        }
      },
      include: {
        tenant: true
      }
    })

    const invoices = []

    for (const lease of leases) {
      const existing = await prisma.invoice.findFirst({
        where: {
          leaseId: lease.id,
          tenantProfileId: lease.tenantProfileId,
          month,
          year
        }
      })

      if (existing) {
        invoices.push(existing)
        continue
      }

      const dueDate = new Date(year, month - 1, lease.rentDueDay || 1)

      const invoice = await prisma.invoice.create({
        data: {
          propertyId,
          tenantProfileId: lease.tenantProfileId,
          leaseId: lease.id,
          month,
          year,
          amount: lease.rentAmount,
          dueDate,
          status: InvoiceStatus.PENDING
        }
      })

      invoices.push(invoice)
    }

    return invoices
  } catch (error) {
    console.log('Error generating invoices:', error)
    throw error
  }
}

export async function recordPayment(
  invoiceId: string,
  tenantProfileId: string,
  amount: number,
  method: PaymentMethod,
  transactionRef?: string,
  proofUrl?: string
) {
  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId }
    })

    if (!invoice) {
      throw new Error('Invoice not found')
    }

    const payment = await prisma.payment.create({
      data: {
        invoiceId,
        tenantProfileId,
        amount: new Decimal(amount),
        method,
        status: PaymentStatus.SUCCESS,
        transactionRef,
        proofUrl
      }
    })

    const totalPaid = await prisma.payment.aggregate({
      where: { invoiceId },
      _sum: { amount: true }
    })

    const paidAmount = totalPaid._sum.amount || new Decimal(0)

    let newStatus: InvoiceStatus = InvoiceStatus.PENDING
    if (paidAmount.gte(invoice.amount)) {
      newStatus = InvoiceStatus.PAID
    } else if (paidAmount.gt(0)) {
      newStatus = InvoiceStatus.PAID
    } else if (new Date() > invoice.dueDate) {
      newStatus = InvoiceStatus.OVERDUE
    }

    await prisma.invoice.update({
      where: { id: invoiceId },
      data: { status: newStatus }
    })

    return payment
  } catch (error) {
    console.log('Error recording payment:', error)
    throw error
  }
}

export async function getPropertyStats(propertyId: string) {
  try {
    const [
      roomCount,
      activeTenantCount,
      totalMonthlyRent,
      pendingInvoices,
      unpaidAmount
    ] = await Promise.all([
      prisma.room.count({ where: { propertyId } }),
      prisma.tenantProfile.count({ where: { propertyId, status: TenantStatus.ACTIVE } }),
      prisma.lease.aggregate({
        where: {
          propertyId,
          isActive: true,
          startDate: { lte: new Date() },
          endDate: { gte: new Date() }
        },
        _sum: { rentAmount: true }
      }),
      prisma.invoice.count({
        where: {
          propertyId,
          status: { in: [InvoiceStatus.PENDING, InvoiceStatus.OVERDUE] }
        }
      }),
      prisma.invoice.aggregate({
        where: {
          propertyId,
          status: { in: [InvoiceStatus.PENDING, InvoiceStatus.OVERDUE] }
        },
        _sum: { amount: true }
      })
    ])

    const totalPaid = await prisma.payment.aggregate({
      where: {
        invoice: {
          propertyId
        }
      },
      _sum: { amount: true }
    })

    return {
      roomCount,
      activeTenants: activeTenantCount,
      totalMonthlyRent: totalMonthlyRent._sum.rentAmount || new Decimal(0),
      occupiedRooms: activeTenantCount,
      vacantRooms: roomCount - activeTenantCount,
      pendingInvoices,
      unpaidAmount: unpaidAmount._sum.amount || new Decimal(0),
      totalCollected: totalPaid._sum.amount || new Decimal(0)
    }
  } catch (error) {
    console.log('Error getting property stats:', error)
    throw error
  }
}


export async function validateTenantEmail(email: string, propertyId: string, excludeTenantProfileId?: string) {
  try {
    const existing = await prisma.tenantProfile.findFirst({
      where: {
        email,
        propertyId,
        status: 'ACTIVE',
        ...(excludeTenantProfileId && { NOT: { id: excludeTenantProfileId } })
      }
    })

    return !existing
  } catch (error) {
    console.log('Error validating tenant email:', error)
    throw error
  }
}

export async function validateRoomNumber(roomNumber: string, propertyId: string, excludeRoomId?: string) {
  try {
    const existing = await prisma.room.findFirst({
      where: {
        roomNumber,
        propertyId,
        ...(excludeRoomId && { NOT: { id: excludeRoomId } })
      }
    })

    return !existing
  } catch (error) {
    console.log('Error validating room number:', error)
    throw error
  }
}
