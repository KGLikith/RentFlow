'use client'

import {
  SidebarProvider,
} from '@/components/ui/sidebar'

import { MobileHeader } from '@/components/layout/mobile-header'
import { MobileBottomNav } from '@/components/layout/mobile-bottom-nav'
import { AppSidebar } from '@/components/layout/sidebar'
import { useIsMobile } from '@/hooks/use-mobile'
import { ProfileGate } from '@/components/auth/dasboard/profile-gate'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const isMobile = useIsMobile()

  return (
    <SidebarProvider>
      <div className="flex h-screen overflow-hidden w-full bg-background">

        <AppSidebar />

        <div className="flex-1 flex flex-col">

          {isMobile && <MobileHeader />}

          <main className="flex-1 overflow-y-auto scrollbar-none bg-[#f8faf9]">

            <div className="p-4 md:p-6 pb-28 md:pb-6">
              <ProfileGate>
                {children}
              </ProfileGate>
            </div>
          </main>

          {isMobile && <MobileBottomNav />}
        </div>
      </div>
    </SidebarProvider>
  )
}