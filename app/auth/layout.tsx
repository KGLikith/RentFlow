import { auth } from '@clerk/nextjs/server'
import { Building2 } from 'lucide-react'
import { redirect } from 'next/navigation'

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { userId } = await auth()

  if (userId) {
    redirect('/dashboard')
  }

  return (
    <div className="flex min-h-screen">

      <div className="hidden lg:flex lg:w-1/2 bg-[hsl(var(--surface-mint))] dark:bg-[hsl(var(--surface-mint))] relative">

        <div className="absolute inset-0 bg-linear-to-br from-white/40 to-transparent dark:from-white/5" />
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_30%_80%,hsl(var(--primary)/0.2),transparent)]" />

        <div className="relative z-10 flex flex-col justify-between p-12 w-full">

          <div className="flex items-center gap-3">
            <div className="bg-primary rounded-xl p-2">
              <Building2 className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-lg tracking-tight text-foreground">
              RentFlow
            </span>
          </div>

          <div className="space-y-6">
            <h1 className="text-5xl lg:text-6xl font-bold leading-[1.08] text-foreground">
              Collect rent,
              <br />
              without chaos.
            </h1>

            <p className="text-lg max-w-md leading-relaxed text-muted-foreground">
              Automate rent collection, reminders, and tenant management —
              all in one place.
            </p>
          </div>

          <p className="text-sm text-muted-foreground/70">
            © 2026 RentFlow. Built for modern landlords.
          </p>

        </div>
      </div>


      {children}

    </div>
  )
}