
export function PropertyTypeCard({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-card p-5 hover:shadow-md hover:border-primary/30 transition-all cursor-default">
      <div className="rounded-xl bg-primary/10 p-3">
        <Icon className="h-6 w-6 text-primary" />
      </div>
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
}