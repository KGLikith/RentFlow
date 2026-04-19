'use client'

import Link from 'next/link'
import { Building2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function Navbar({ userId }: { userId: string | null }) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-5 md:px-12 lg:px-20 py-4 bg-white/90 backdrop-blur-md border-b border-border/50">
      
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-primary p-2">
          <Building2 className="h-5 w-5 text-primary-foreground" />
        </div>
        <span className="font-semibold text-lg md:text-xl tracking-tight">
          RentFlow
        </span>
      </div>

      <div className="flex items-center gap-3">
        {userId ? (
          <Link href="/dashboard">
            <Button
              size="sm"
              className="rounded-full px-6 h-10 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Go to Dashboard
            </Button>
          </Link>
        ) : (
          <>
            <Link href="/auth/sign-in">
              <Button variant="ghost" size="sm" className="h-10 px-4">
                Sign in
              </Button>
            </Link>
            <Link href="/auth/sign-up">
              <Button
                size="sm"
                className="rounded-full px-6 h-10 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Get Started
              </Button>
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}