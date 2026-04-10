export const CACHE_KEYS = {
  DASHBOARD: (ownerId: string) => `dashboard:${ownerId}`,
  
  PROPERTIES_LIST: (ownerId: string) => `properties:${ownerId}`,
  PROPERTY_DETAIL: (propertyId: string) => `property:${propertyId}`,
  
  ROOMS_LIST: (propertyId: string) => `rooms:${propertyId}`,
  ROOM_DETAIL: (roomId: string) => `room:${roomId}`,
  
  TENANTS_LIST: (ownerId: string) => `tenants:${ownerId}`,
  TENANT_PROFILES: (propertyId: string) => `tenant_profiles:${propertyId}`,
  TENANT_DETAIL: (tenantId: string) => `tenant:${tenantId}`,
  
  TENANT_DASHBOARD: (userId: string) => `tenant_dashboard:${userId}`,
  TENANT_LEASES: (userId: string) => `tenant_leases:${userId}`,
  TENANT_INVOICES: (userId: string) => `tenant_invoices:${userId}`,
  
  LEASES_LIST: (ownerId: string) => `leases:${ownerId}`,
  LEASE_DETAIL: (leaseId: string) => `lease:${leaseId}`,
  
  INVOICES_LIST: (ownerId: string) => `invoices:${ownerId}`,
  INVOICE_DETAIL: (invoiceId: string) => `invoice:${invoiceId}`,
  
  PAYMENTS_LIST: (ownerId: string) => `payments:${ownerId}`,
  TENANT_PAYMENTS: (tenantId: string) => `tenant_payments:${tenantId}`,
  
  OWNER_STATS: (ownerId: string) => `stats:owner:${ownerId}`,
  PROPERTY_STATS: (propertyId: string) => `stats:property:${propertyId}`,
}

export const QUERY_KEYS = {
  dashboard: ['dashboard'] as const,
  dashboardDetail: (ownerId: string) => ['dashboard', ownerId] as const,
  
  properties: ['properties'] as const,
  propertiesList: (ownerId: string) => ['properties', ownerId] as const,
  propertyDetail: (propertyId: string) => ['property', propertyId] as const,
  
  rooms: ['rooms'] as const,
  roomsList: (propertyId: string) => ['rooms', propertyId] as const,
  roomDetail: (roomId: string) => ['room', roomId] as const,
  
  tenants: ['tenants'] as const,
  tenantsList: (ownerId: string) => ['tenants', ownerId] as const,
  tenantProfiles: (propertyId: string) => ['tenant_profiles', propertyId] as const,
  tenantDetail: (tenantId: string) => ['tenant', tenantId] as const,
  
  tenantDashboard: ['tenant_dashboard'] as const,
  tenantDashboardDetail: (userId: string) => ['tenant_dashboard', userId] as const,
  tenantLeases: (userId: string) => ['tenant_leases', userId] as const,
  tenantInvoices: (userId: string) => ['tenant_invoices', userId] as const,
  
  leases: ['leases'] as const,
  leasesList: (ownerId: string) => ['leases', ownerId] as const,
  leaseDetail: (leaseId: string) => ['lease', leaseId] as const,
  
  invoices: ['invoices'] as const,
  invoicesList: (ownerId: string) => ['invoices', ownerId] as const,
  invoiceDetail: (invoiceId: string) => ['invoice', invoiceId] as const,
  
  payments: ['payments'] as const,
  paymentsList: (ownerId: string) => ['payments', ownerId] as const,
  tenantPayments: (tenantId: string) => ['tenant_payments', tenantId] as const,
  
  stats: ['stats'] as const,
  ownerStats: (ownerId: string) => ['stats', 'owner', ownerId] as const,
  propertyStats: (propertyId: string) => ['stats', 'property', propertyId] as const,
}

export const CACHE_TTL = {
  VERY_SHORT: 60,        
  SHORT: 120,
  MEDIUM: 300,
  LONG: 900,
  VERY_LONG: 3600,       
}

export const DEFAULT_TTL = {
  dashboard: CACHE_TTL.VERY_SHORT,      
  properties: CACHE_TTL.MEDIUM,         
  rooms: CACHE_TTL.MEDIUM,              
  tenants: CACHE_TTL.MEDIUM,            
  leases: CACHE_TTL.LONG,               
  invoices: CACHE_TTL.SHORT,            
  payments: CACHE_TTL.SHORT,            
  stats: CACHE_TTL.VERY_SHORT,
  tenantDashboard: CACHE_TTL.VERY_SHORT, 
}
