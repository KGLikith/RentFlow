'use client'

import {
  LayoutDashboard,
  Building2,
  Users,
  Receipt,
} from 'lucide-react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'

const nav = [
  { label: 'Home', icon: LayoutDashboard, href: '/dashboard' },
  { label: 'Properties', icon: Building2, href: '/dashboard/properties' },
  { label: 'Tenants', icon: Users, href: '/dashboard/tenants' },
  { label: 'Invoices', icon: Receipt, href: '/dashboard/invoices' },
]

export function MobileBottomNav() {
  const pathname = usePathname()

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white/95 backdrop-blur supports-backdrop-filter:bg-white/80 shadow-[0_-2px_16px_rgba(0,0,0,0.06)]">

      <div className="flex justify-between px-2 py-2">
        {nav.map((item) => {
          const active =
            item.href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname.startsWith(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex-1"
            >
              <div
                className={cn(
                  'flex flex-col items-center justify-center gap-1 py-1.5 rounded-lg transition-all duration-200',
                  
                  active
                    ? 'text-orange-500'
                    : 'text-gray-400 hover:text-gray-700'
                )}
              >
                <item.icon
                  className={cn(
                    'w-5 h-5 transition-all',
                    active && 'scale-110'
                  )}
                />

                <span className="text-[11px] font-medium">
                  {item.label}
                </span>

                {/* ACTIVE INDICATOR */}
                <div
                  className={cn(
                    'h-[2px] w-4 rounded-full transition-all',
                    active
                      ? 'bg-orange-500 opacity-100'
                      : 'opacity-0'
                  )}
                />
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}