'use client'

import { UserButton } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export function Header() {
  return (
    <header className="border-b border-gray-200 bg-white sticky top-0 z-40">
      <div className="px-4 md:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="text-xl font-bold text-indigo-600">Property Manager</div>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/dashboard/announcements">
            <Button variant="ghost" className="text-gray-600 hover:text-gray-900">
              Announcements
            </Button>
          </Link>
          <Link href="/dashboard/settings">
            <Button variant="ghost" className="text-gray-600 hover:text-gray-900">
              Settings
            </Button>
          </Link>
          <UserButton />
        </div>
      </div>
    </header>
  )
}
