'use client'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from '@/components/ui/sidebar'

import {
  LayoutDashboard,
  Building2,
  Users,
  FileText,
  Bell,
  Settings,
  LogOut,
} from 'lucide-react'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useUser } from '@clerk/nextjs'
import { LogoutDialog } from './logout-dialog'

const nav = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Properties', href: '/dashboard/properties', icon: Building2 },
  { label: 'Tenants', href: '/dashboard/tenants', icon: Users },
  { label: 'Invoices', href: '/dashboard/invoices', icon: FileText },
  { label: 'Notifications', href: '/dashboard/notifications', icon: Bell },
]

export function AppSidebar() {
  const pathname = usePathname()
  const { user } = useUser()
  const { setOpenMobile, isMobile } = useSidebar()

  const handleNavClick = () => {
    if (isMobile) setOpenMobile(false)
  }

  return (
    <Sidebar
      className={cn(
        'sticky top-0 h-screen',
        'bg-[#e4ece9]',
        'border-r border-gray-300 text-black'
      )}
    >
      {/* HEADER */}
      <SidebarHeader className="px-5 py-5 border-b border-gray-200 bg-[#e4ece9]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-orange-500 text-white rounded-lg flex items-center justify-center font-bold text-sm shadow-sm">
            RF
          </div>
          <span className="font-semibold text-[15px] tracking-tight text-gray-800">
            RentFlow
          </span>
        </div>
      </SidebarHeader>

      {/* NAV */}
      <SidebarContent className="px-3 py-4 bg-[#e4ece9]">
        <SidebarMenu className="space-y-1.5">
          {nav.map((item) => {
            const active =
              item.href === '/dashboard'
                ? pathname === '/dashboard'
                : pathname.startsWith(item.href)

            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={active}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all',
                    active
                      ? 'bg-white shadow-[0_2px_6px_rgba(0,0,0,0.06)] text-gray-900 font-medium'
                      : 'text-gray-600 hover:bg-white/70 hover:text-gray-900'
                  )}
                >
                  <Link href={item.href} onClick={handleNavClick}>
                    <item.icon
                      className={cn(
                        'w-4 h-4',
                        active ? 'text-gray-900' : 'text-gray-500'
                      )}
                    />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarContent>

      {/* FOOTER */}
      <SidebarFooter className="mt-auto border-t border-gray-200 px-4 py-4 space-y-3 bg-[#e4ece9]">
        
        {/* USER */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-gray-300 flex items-center justify-center text-[11px] font-semibold text-gray-700">
            {user?.firstName?.[0] ?? 'U'}
          </div>
          <p className="text-xs text-gray-600 truncate">
            {user?.primaryEmailAddress?.emailAddress || 'Loading...'}
          </p>
        </div>

        {/* ACTIONS */}
        <SidebarMenu className="space-y-1">

          {/* SETTINGS */}
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="hover:bg-white/70 rounded-lg"
            >
              <Link
                href="/dashboard/settings"
                onClick={handleNavClick}
                className="flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                <span className="text-sm">Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          {/* LOGOUT */}
          <SidebarMenuItem>
            <LogoutDialog onConfirm={handleNavClick}>
              <SidebarMenuButton className="hover:bg-red-50 text-red-500 rounded-lg">
                <LogOut className="w-4 h-4" />
                <span className="text-sm">Sign out</span>
              </SidebarMenuButton>
            </LogoutDialog>
          </SidebarMenuItem>

        </SidebarMenu>

      </SidebarFooter>
    </Sidebar>
  )
}