'use client'

import { Bell, Settings, LogOut } from 'lucide-react'
import { SidebarTrigger } from '@/components/ui/sidebar'
import Link from 'next/link'
import { LogoutDialog } from './logout-dialog'

export function MobileHeader() {

    return (
        <div className="lg:hidden sticky top-0 z-40 bg-white border-b px-4 py-3 flex items-center justify-between">

            <div className="flex items-center gap-2">
                <SidebarTrigger />

                <div className="w-7 h-7 bg-orange-500 rounded-md flex items-center justify-center text-white text-xs font-bold">
                    RF
                </div>

                <span className="font-medium">RentFlow</span>
            </div>

            <div className="flex items-center gap-3">
                <Link
                    href="/dashboard/notifications"
                    className="p-2 rounded-md hover:bg-gray-100 transition"
                >
                    <Bell className="w-5 h-5 text-gray-600" />
                </Link>

                <Link
                    href="/dashboard/settings"
                    className="p-2 rounded-md hover:bg-gray-100 transition"
                >
                    <Settings className="w-5 h-5 text-gray-600" />
                </Link>

                <LogoutDialog>
                    <button className="p-2 rounded-md hover:bg-red-50 transition">
                        <LogOut className="w-5 h-5 text-red-500" />
                    </button>
                </LogoutDialog>

            </div>
        </div>
    )
}