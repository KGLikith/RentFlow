export default function PhoneMockup({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative mx-auto w-[260px] md:w-[280px]">
      <div className="rounded-4xl border-[6px] border-foreground/10 bg-card shadow-2xl overflow-hidden">
        <div className="flex justify-center pt-2 pb-1">
          <div className="w-20 h-1.5 rounded-full bg-foreground/10" />
        </div>
        <div className="px-4 pb-6">
          {children}
        </div>
      </div>
    </div>
  );
}