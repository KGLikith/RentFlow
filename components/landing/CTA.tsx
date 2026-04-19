import Link from 'next/link'
import React from 'react'
import { Button } from '../ui/button'
import { ArrowRight } from 'lucide-react'

export default function CTA() {
  return (
    <section className="relative z-6 overflow-hidden rounded-t-4xl -mt-8 bg-primary text-primary-foreground">
        <div className="px-5 md:px-12 lg:px-20 py-20 text-center">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            Ready to simplify rent collection?
          </h2>
          <p className="text-lg text-primary-foreground/80 mb-8 max-w-lg mx-auto">
            Join thousands of landlords who collect rent on time, every month.
          </p>
          <Link href="/auth">
            <Button size="lg" variant="secondary" className="rounded-full text-base font-semibold px-8 h-12 gap-2">
              Start collecting rent <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <p className="text-xs text-primary-foreground/60 mt-4">Free forever for up to 10 tenants</p>
        </div>
      </section>
  )
}