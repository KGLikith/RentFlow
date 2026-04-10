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
          ownerId: lease.ownerId,
          leaseId: lease.id,
          month,
          year,
          amount: lease.rentAmount,
          dueDate,
          status: 'PENDING'
        }
      })

      invoices.push(invoice)
    }

    return invoices
  } catch (error) {
    console.error('[v0] Error generating invoices:', error)
    throw error
  }
}

export async function recordPayment(
  invoiceId: string,
  tenantProfileId: string,
  ownerId: string,
  amount: number,
  method: 'UPI' | 'BANK_TRANSFER' | 'CASH',
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
        ownerId,
        amount: new Decimal(amount),
        method,
        status: 'SUCCESS',
        transactionRef,
        proofUrl
      }
    })

    const totalPaid = await prisma.payment.aggregate({
      where: { invoiceId },
      _sum: { amount: true }
    })

    const paidAmount = totalPaid._sum.amount || new Decimal(0)

    let newStatus = 'PENDING'
    if (paidAmount.gte(invoice.amount)) {
      newStatus = 'PAID'
    } else if (paidAmount.gt(0)) {
      newStatus = 'PAID' 
    } else if (new Date() > invoice.dueDate) {
      newStatus = 'OVERDUE'
    }

    await prisma.invoice.update({
      where: { id: invoiceId },
      data: { status: newStatus }
    })

    return payment
  } catch (error) {
    console.error('[v0] Error recording payment:', error)
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
      prisma.tenantProfile.count({ where: { propertyId, status: 'ACTIVE' } }),
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
          status: { in: ['PENDING', 'OVERDUE'] }
        }
      }),
      prisma.invoice.aggregate({
        where: {
          propertyId,
          status: { in: ['PENDING', 'OVERDUE'] }
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
    console.error('[v0] Error getting property stats:', error)
    throw error
  }
}

/**
 * Data Validation Utilities
 */

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
    console.error('[v0] Error validating tenant email:', error)
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
    console.error('[v0] Error validating room number:', error)
    throw error
  }
}
