import { Receipt, Bell, IndianRupee, Clock, BarChart3, MessageSquare, Zap } from 'lucide-react'

export default function Features() {
  const features = [
    { icon: Receipt, title: "Auto Invoice Generation", desc: "Generate monthly invoices for all active tenants with a single click. No duplicates, no missed bills." },
    { icon: Bell, title: "Smart Reminders", desc: "Automatic reminders 2 days before, on due date, and after — via app, email, or WhatsApp." },
    { icon: IndianRupee, title: "UPI Payment Links", desc: "Generate direct UPI payment links per invoice. Tenants pay you directly — no intermediary." },
    { icon: Clock, title: "Late Fee Tracking", desc: "Auto-flag overdue invoices. Add late fees after grace period automatically." },
    { icon: BarChart3, title: "Revenue Dashboard", desc: "See total revenue, pending payments, occupancy rates, and expenses at a glance." },
    { icon: MessageSquare, title: "Property Announcements", desc: "Broadcast messages to all tenants of a property. Maintenance alerts, rule updates, and more." },
  ];

  return (
    <section className="relative z-2 overflow-hidden rounded-t-4xl bg-muted">
        <div className="px-5 md:px-12 lg:px-20 pt-20 pb-24">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold text-primary uppercase tracking-wider mb-4">
                <Zap className="h-3 w-3 mr-1.5" /> 100% Automatic
              </span>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
                Automatic Rent &amp; Due Collection
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                No more calls. No more running after tenants. Set it up once, collect every month.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((f) => (
                <div key={f.title} className="bg-card rounded-2xl p-6 border hover:shadow-md hover:border-primary/20 transition-all">
                  <div className="rounded-xl bg-primary/10 p-3 w-fit mb-4">
                    <f.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-base mb-2">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
  )
}