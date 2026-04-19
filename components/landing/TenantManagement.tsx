import React from 'react'
import FeatureRow from './helper/FeatureRow'
import { CheckCircle, CreditCard, Shield, Smartphone, Users } from 'lucide-react'

export default function TenantManagement() {
  return (
    <section className="relative z-4 overflow-hidden rounded-t-4xl -mt-8 bg-muted">
        <div className="px-5 md:px-12 lg:px-20 pt-20 pb-24">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold text-primary uppercase tracking-wider mb-4">
                Tenant Management
              </span>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6">
                All tenant details in one place
              </h2>
              <div className="space-y-5">
                <FeatureRow icon={Users} title="Quick onboarding" desc="Add a tenant in under 30 seconds. Auto-creates lease and assigns room." />
                <FeatureRow icon={Shield} title="Secure & isolated" desc="Each owner's data is completely isolated. No cross-tenant access." />
                <FeatureRow icon={Smartphone} title="Mobile-first" desc="Manage everything from your phone browser. No app download needed." />
                <FeatureRow icon={CreditCard} title="Payment tracking" desc="Track UPI, card, and cash payments. Upload proof or mark manually." />
              </div>
            </div>

            <div className="flex justify-center">
              <div className="w-full max-w-sm rounded-2xl border bg-card shadow-xl p-6 space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Sunshine PG</h3>
                  <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" /> Active
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: "Filled Beds", value: "18" },
                    { label: "Vacant Beds", value: "06" },
                    { label: "Tenants", value: "18" },
                    { label: "Collection", value: "₹1,62,000" },
                  ].map((s) => (
                    <div key={s.label} className="rounded-xl bg-muted p-3">
                      <p className="text-xl font-bold">{s.value}</p>
                      <p className="text-xs text-muted-foreground">{s.label}</p>
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  {[
                    { label: "Pending", value: "₹36,000", color: "text-amber-600" },
                    { label: "Late", value: "₹12,000", color: "text-red-600" },
                    { label: "Expenses", value: "₹8,500", color: "text-muted-foreground" },
                  ].map((r) => (
                    <div key={r.label} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                      <span className="text-sm text-muted-foreground">{r.label}</span>
                      <span className={`text-sm font-semibold ${r.color}`}>{r.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
  )
}