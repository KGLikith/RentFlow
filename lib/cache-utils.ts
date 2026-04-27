import { getOrSetCache, invalidateCache } from '@/lib/redis'
import { CACHE_KEYS, DEFAULT_TTL } from '@/lib/cache-keys'
import { prisma } from '@/lib/prisma'
import { InvoiceStatus, TenantStatus } from '@/app/generated/prisma/enums'

export async function getDashboardData(ownerId: string) {
  return getOrSetCache(
    CACHE_KEYS.DASHBOARD(ownerId),
    async () => {
      const [
        propertiesCount,
        roomsCount,
        tenantsCount,
        activeLeases,
        monthlyRevenue,
        pendingInvoices,
      ] = await Promise.all([
        prisma.property.count({ where: { ownerId } }),
        prisma.room.count({
          where: { property: { ownerId } },
        }),
        prisma.tenantProfile.count({
          where: { ownerId, status: TenantStatus.ACTIVE },
        }),
        prisma.lease.count({
          where: { property: { ownerId }, isActive: true },
        }),
        prisma.payment.aggregate({
          where: {
            invoice: {
              property: { ownerId },
              createdAt: { gte: new Date(new Date().setDate(1)) },
            },
          },
          _sum: { amount: true },
        }),
        prisma.invoice.count({
          where: { property: { ownerId }, status: InvoiceStatus.PENDING },
        }),
      ])

      return {
        properties: propertiesCount,
        rooms: roomsCount,
        tenants: tenantsCount,
        activeLeases,
        monthlyRevenue: monthlyRevenue._sum.amount || 0,
        pendingInvoices,
      }
    },
    DEFAULT_TTL.dashboard
  )
}

export async function getPropertiesList(ownerId: string) {
  return getOrSetCache(
    CACHE_KEYS.PROPERTIES_LIST(ownerId),
    async () => {
      return prisma.property.findMany({
        where: { ownerId },
        include: {
          _count: {
            select: { rooms: true, tenants: true },
          },
        },
      })
    },
    DEFAULT_TTL.properties
  )
}

export async function getPropertyDetail(propertyId: string) {
  return getOrSetCache(
    CACHE_KEYS.PROPERTY_DETAIL(propertyId),
    async () => {
      return prisma.property.findUnique({
        where: { id: propertyId },
        include: {
          rooms: true,
          tenants: true,
        },
      })
    },
    DEFAULT_TTL.properties
  )
}

export async function getRoomsList(propertyId: string) {
  return getOrSetCache(
    CACHE_KEYS.ROOMS_LIST(propertyId),
    async () => {
      return prisma.room.findMany({
        where: { propertyId },
        include: {
          _count: {
            select: { tenants: true },
          },
        },
      })
    },
    DEFAULT_TTL.rooms
  )
}

export async function getTenantsList(ownerId: string) {
  return getOrSetCache(
    CACHE_KEYS.TENANTS_LIST(ownerId),
    async () => {
      return prisma.tenantProfile.findMany({
        where: { ownerId },
        include: {
          user: true,
          room: true,
          property: true,
        },
      })
    },
    DEFAULT_TTL.tenants
  )
}

export async function getTenantProfiles(propertyId: string) {
  return getOrSetCache(
    CACHE_KEYS.TENANT_PROFILES(propertyId),
    async () => {
      return prisma.tenantProfile.findMany({
        where: { propertyId },
        include: {
          user: true,
          room: true,
        },
      })
    },
    DEFAULT_TTL.tenants
  )
}

export async function getTenantDashboardData(userId: string) {
  return getOrSetCache(
    CACHE_KEYS.TENANT_DASHBOARD(userId),
    async () => {
      const tenancies = await prisma.tenantProfile.findMany({
        where: { userId, status: TenantStatus.ACTIVE },
        include: {
          property: true,
          room: true,
          leases: { take: 1, orderBy: { startDate: 'desc' } },
        },
      })

      const invoices = await prisma.invoice.findMany({
        where: {
          tenantProfileId: { in: tenancies.map((t) => t.id) },
        },
        include: { payments: true },
      })

      const payments = await prisma.payment.findMany({
        where: {
          invoice: {
            tenantProfileId: { in: tenancies.map((t) => t.id) },
          },
        },
      })

      return {
        tenancies,
        invoices,
        payments,
        pendingAmount: invoices
          .filter((inv) => inv.status === InvoiceStatus.PENDING)
          .reduce((sum, inv) => sum + Number(inv.amount), 0),

        totalPaid: payments.reduce(
          (sum, p) => sum + Number(p.amount),
          0
        ),
      }
    },
    DEFAULT_TTL.tenantDashboard
  )
}

export async function getInvoicesList(ownerId: string) {
  return getOrSetCache(
    CACHE_KEYS.INVOICES_LIST(ownerId),
    async () => {
      return prisma.invoice.findMany({
        where: { property: { ownerId } },
        include: {
          tenant: true,
          property: true,
          payments: true,
        },
      })
    },
    DEFAULT_TTL.invoices
  )
}

export async function getPaymentsList(ownerId: string) {
  return getOrSetCache(
    CACHE_KEYS.PAYMENTS_LIST(ownerId),
    async () => {
      return prisma.payment.findMany({
        where: { invoice: { property: { ownerId } } },
        include: {
          invoice: { include: { tenant: true } },
        },
      })
    },
    DEFAULT_TTL.payments
  )
}

export async function invalidatePropertyCache(
  ownerId: string,
  propertyId?: string
) {
  const keys = [
    CACHE_KEYS.PROPERTIES_LIST(ownerId),
    CACHE_KEYS.DASHBOARD(ownerId),
  ]

  if (propertyId) {
    keys.push(CACHE_KEYS.PROPERTY_DETAIL(propertyId))
    keys.push(CACHE_KEYS.ROOMS_LIST(propertyId))
  }

  await invalidateCache(keys)
}

export async function invalidateRoomCache(
  propertyId: string,
  ownerId: string,
  roomId?: string
) {
  const keys = [
    CACHE_KEYS.ROOMS_LIST(propertyId),
    CACHE_KEYS.PROPERTY_DETAIL(propertyId),
    CACHE_KEYS.DASHBOARD(ownerId),
  ]

  if (roomId) {
    keys.push(CACHE_KEYS.ROOM_DETAIL(roomId))
  }

  await invalidateCache(keys)
}

export async function invalidateTenantCache(
  ownerId: string,
  propertyId?: string,
  tenantId?: string,
  userId?: string
) {
  const keys = [
    CACHE_KEYS.TENANTS_LIST(ownerId),
    CACHE_KEYS.DASHBOARD(ownerId),
  ]

  if (propertyId) {
    keys.push(CACHE_KEYS.TENANT_PROFILES(propertyId))
  }

  if (tenantId) {
    keys.push(CACHE_KEYS.TENANT_DETAIL(tenantId))
  }

  if (userId) {
    keys.push(CACHE_KEYS.TENANT_DASHBOARD(userId))
    keys.push(CACHE_KEYS.TENANT_INVOICES(userId))
    keys.push(CACHE_KEYS.TENANT_LEASES(userId))
  }

  await invalidateCache(keys)
}

export async function invalidatePaymentCache(
  ownerId: string,
  userId?: string
) {
  const keys = [
    CACHE_KEYS.PAYMENTS_LIST(ownerId),
    CACHE_KEYS.DASHBOARD(ownerId),
  ]

  if (userId) {
    keys.push(CACHE_KEYS.TENANT_DASHBOARD(userId))
    keys.push(CACHE_KEYS.TENANT_INVOICES(userId))
  }

  await invalidateCache(keys)
}

export async function invalidateInvoiceCache(ownerId: string) {
  const keys = [
    CACHE_KEYS.INVOICES_LIST(ownerId),
    CACHE_KEYS.DASHBOARD(ownerId),
  ]

  await invalidateCache(keys)
}