export default function MockTenantRow({ name, room, amount, status }: { name: string; room: string; amount: string; status: "paid" | "pending" | "late" }) {
  const colors = { paid: "text-emerald-600 bg-emerald-50", pending: "text-amber-600 bg-amber-50", late: "text-red-600 bg-red-50" };
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-border/50 last:border-0">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
          {name.split(" ").map(n => n[0]).join("")}
        </div>
        <div>
          <p className="text-xs font-medium leading-tight">{name}</p>
          <p className="text-[10px] text-muted-foreground">{room}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-xs font-semibold">₹{amount}</p>
        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${colors[status]}`}>
          {status === "paid" ? "Paid" : status === "pending" ? "Due" : "Late"}
        </span>
      </div>
    </div>
  );
}