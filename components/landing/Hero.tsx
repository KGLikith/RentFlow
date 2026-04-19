'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  ArrowRight,
  Bell,
  Building2,
  CreditCard,
  DoorOpen,
  Home,
  Receipt,
  Users,
} from 'lucide-react'
import { PropertyTypeCard } from './helper/PropertyTypeCard'
import PhoneMockup from './helper/PhoneMockUp'
import MockTenantRow from './helper/MockTenantRow'

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-primary/3" />

      <div className="relative z-10 px-5 md:px-12 lg:px-20 pt-24 pb-16 md:pt-24 md:pb-28">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          
          <div>
            <h1 className="text-3xl md:text-4xl lg:text-[3.25rem] font-bold tracking-tight leading-[1.1] mb-5">
              The easiest way to{" "}
              <span className="text-primary">collect rent</span>{" "}
              &amp; manage tenants
            </h1>

            <p className="text-base md:text-lg text-muted-foreground max-w-lg mb-6 leading-relaxed">
              Built for PG owners, landlords, and small recurring-revenue businesses.{" "}
              <span className="text-foreground font-medium">
                Save time. Reduce follow-ups. Stay organized.
              </span>
            </p>

            <p className="text-xs uppercase tracking-wide text-muted-foreground mb-3">
              What are you managing?
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
              <PropertyTypeCard icon={Home} label="Co-Living" />
              <PropertyTypeCard icon={Building2} label="Hostel / PG" />
              <PropertyTypeCard icon={DoorOpen} label="Flat" />
              <PropertyTypeCard icon={Users} label="Studio" />
            </div>

            <div className="flex flex-col sm:flex-row items-start gap-3">
              <Link href="/auth/sign-up">
                <Button
                  size="lg"
                  className="rounded-full text-base font-semibold px-8 h-12 gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Get started free <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>

              <p className="text-xs text-muted-foreground mt-2 sm:mt-3">
                No credit card required • Setup in under 2 minutes
              </p>
            </div>
          </div>

          <div className="flex justify-center lg:justify-end">
            <PhoneMockup>
              <div className="space-y-3">
                
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-semibold">Select Tenant</p>
                  <span className="text-[10px] text-primary font-medium cursor-pointer">
                    View All
                  </span>
                </div>

                <MockTenantRow name="Rahul Sharma" room="Room 101" amount="10,000" status="paid" />
                <MockTenantRow name="Priya Patel" room="Room 203" amount="8,500" status="pending" />
                <MockTenantRow name="Amit Verma" room="Room 105" amount="12,000" status="late" />
                <MockTenantRow name="Sneha Gupta" room="Room 302" amount="9,000" status="paid" />
                <MockTenantRow name="Karan Singh" room="Room 104" amount="10,500" status="pending" />

                <div className="rounded-xl border bg-card shadow-lg p-3 mt-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold">Quick Actions</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { icon: Bell, label: "Remind" },
                      { icon: Receipt, label: "Invoice" },
                      { icon: CreditCard, label: "Record" },
                    ].map((a) => (
                      <div
                        key={a.label}
                        className="flex flex-col items-center gap-1 rounded-lg bg-primary/5 py-2 hover:bg-primary/10 transition"
                      >
                        <a.icon className="h-4 w-4 text-primary" />
                        <span className="text-[10px] font-medium">{a.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </PhoneMockup>
          </div>

        </div>
      </div>
    </section>
  )
}