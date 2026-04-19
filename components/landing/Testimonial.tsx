import { Star } from 'lucide-react'
import React from 'react'

export default function Testimonial() {
  return (
    <section className="relative z-5 overflow-hidden rounded-t-4xl -mt-8 bg-card">
        <div className="px-5 md:px-12 lg:px-20 py-20 text-center">
          <div className="max-w-2xl mx-auto">
            <div className="flex justify-center gap-1 mb-4">
              {[...Array(5)].map((_, i) => <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />)}
            </div>
            <blockquote className="text-lg md:text-xl font-medium leading-relaxed mb-6">
              &quot;RentFlow saved me 10+ hours a month. I used to chase tenants for payments,
              now invoices go out automatically and I just track who&apos;s paid.&quot;
            </blockquote>
            <div>
              <p className="font-semibold">Rajesh Kumar</p>
              <p className="text-sm text-muted-foreground">Manages 3 PGs, 45 tenants · Bangalore</p>
            </div>
          </div>
        </div>
      </section>
  )
}