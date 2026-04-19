import { ChevronRight } from 'lucide-react';
import React from 'react'

export default function HowItWorks() {
    const steps = [
        { num: "01", title: "Add your property", desc: "Enter property details and create rooms with capacity limits." },
        { num: "02", title: "Onboard tenants", desc: "Add tenants manually or bulk upload via CSV. Lease auto-created." },
        { num: "03", title: "Generate invoices", desc: "One click generates invoices for all active tenants for the month." },
        { num: "04", title: "Collect payments", desc: "Share UPI links. Mark payments as received. Track everything." },
    ];
    return (
        <section className="relative z-3 overflow-hidden rounded-t-4xl -mt-8 bg-card">
            <div className="px-5 md:px-12 lg:px-20 pt-20 pb-24">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
                            Get started in minutes
                        </h2>
                        <p className="text-muted-foreground">Four simple steps to automate your rent collection</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {steps.map((s, i) => (
                            <div key={s.num} className="relative">
                                <span className="text-5xl font-bold text-primary/10">{s.num}</span>
                                <h3 className="font-semibold text-base mt-2 mb-2">{s.title}</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
                                {i < steps.length - 1 && (
                                    <ChevronRight className="hidden lg:block absolute top-8 -right-3 h-5 w-5 text-primary/30" />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}