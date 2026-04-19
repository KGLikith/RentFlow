import AnimatedNumber from "./helper/AnimatedNumber"

export default function Stats() {
  return (
    <section className="bg-foreground text-background">
        <div className="px-5 md:px-12 lg:px-20 py-10">
          <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: 5000, suffix: "+", label: "Properties Managed" },
              { value: 25000, suffix: "+", label: "Tenants Tracked" },
              { prefix: "₹", value: 50, suffix: "Cr+", label: "Rent Collected" },
              { value: 99, suffix: "%", label: "Uptime" },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-2xl md:text-3xl font-bold">
                  <AnimatedNumber target={s.value} prefix={s.prefix} suffix={s.suffix} />
                </p>
                <p className="text-sm text-background/60 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
  )
}