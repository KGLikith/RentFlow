import { InvoiceStatus, PaymentMethod, PaymentStatus, TenantStatus } from '@/app/generated/prisma/enums'
import { prisma } from './prisma'
import { Decimal } from '@prisma/client/runtime/library'

export async function generateMonthlyInvoices(
  month: number,
  year: number,
  propertyId?: string
) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const whereClause: any = {
      isActive: true,
      startDate: { lte: new Date(year, month, 0) } // Started before or during the end of this billing month
    };
    
    if (propertyId) {
      whereClause.propertyId = propertyId;
    }

    const leases = await prisma.lease.findMany({
      where: whereClause,
      include: {
        tenant: true
      }
    })

    const invoices = []

    for (const lease of leases) {
      // Skip if lease ended before this month started
      if (lease.endDate && lease.endDate < new Date(year, month - 1, 1)) {
        continue;
      }

      const existing = await prisma.invoice.findUnique({
        where: {
          tenantProfileId_month_year_type: {
            tenantProfileId: lease.tenantProfileId,
            month,
            year,
            type: 'RENT'
          }
        }
      })

      if (existing) {
        invoices.push(existing)
        continue
      }

      // Check if due day has passed, or calculate due date properly
      let dueDay = lease.rentDueDay || 1;
      const daysInMonth = new Date(year, month, 0).getDate();
      if (dueDay > daysInMonth) dueDay = daysInMonth; // Handle 31st on Feb etc.
      
      const dueDate = new Date(year, month - 1, dueDay)

      const invoice = await prisma.invoice.create({
        data: {
          propertyId: lease.propertyId,
          tenantProfileId: lease.tenantProfileId,
          leaseId: lease.id,
          month,
          year,
          amount: lease.rentAmount,
          dueDate,
          type: 'RENT',
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
      where: { id: invoiceId },
      include: { lease: true }
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

    let newStatus: InvoiceStatus = invoice.status;
    
    if (paidAmount.gte(invoice.amount)) {
      newStatus = InvoiceStatus.PAID
    } else {
      const graceDays = invoice.lease?.graceDays ?? 5;
      const lateDate = new Date(invoice.dueDate);
      lateDate.setDate(lateDate.getDate() + graceDays);
      
      if (new Date() > lateDate) {
        newStatus = InvoiceStatus.LATE
      } else {
        newStatus = InvoiceStatus.PENDING
      }
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


export async function validateTenantContact(email: string | null | undefined, phone: string | null | undefined, propertyId: string, excludeProfileId?: string) {
  try {
    if (!email && !phone) return false

    const OR = []
    if (email) OR.push({ email })
    if (phone) OR.push({ phone })

    const existing = await prisma.tenantProfile.findFirst({
      where: {
        propertyId,
        status: 'ACTIVE',
        OR,
        ...(excludeProfileId && { NOT: { id: excludeProfileId } }),
      },
    })

    return !existing
  } catch (error) {
    console.log('Error validating tenant contact:', error)
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
