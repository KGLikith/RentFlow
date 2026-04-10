'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

const navItems = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: '📊',
  },
  {
    label: 'Properties',
    href: '/dashboard/properties',
    icon: '🏢',
  },
  {
    label: 'Tenants',
    href: '/dashboard/tenants',
    icon: '👥',
  },
  {
    label: 'Leases',
    href: '/dashboard/leases',
    icon: '📋',
  },
  {
    label: 'Invoices',
    href: '/dashboard/invoices',
    icon: '📄',
  },
  {
    label: 'Payments',
    href: '/dashboard/payments',
    icon: '💰',
  },
  {
    label: 'Announcements',
    href: '/dashboard/announcements',
    icon: '📢',
  },
  {
    label: 'Settings',
    href: '/dashboard/settings',
    icon: '⚙️',
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden md:flex w-64 bg-gray-900 text-white flex-col border-r border-gray-800">
      <div className="p-6 border-b border-gray-800">
        <div className="text-xl font-bold">Property Manager</div>
        <p className="text-sm text-gray-400 mt-1">Rental Management</p>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant="ghost"
                className={cn(
                  'w-full justify-start text-left',
                  isActive
                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-gray-800'
                )}
              >
                <span className="mr-3 text-lg">{item.icon}</span>
                {item.label}
              </Button>
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-gray-800 text-xs text-gray-400">
        <p>© 2024 Property Manager</p>
        <p>All rights reserved</p>
      </div>
    </aside>
  )
}
