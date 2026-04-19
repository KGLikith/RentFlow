import { Building2 } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-foreground text-background/50 px-5 py-8 text-center text-sm">
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="rounded-lg bg-primary p-1.5"><Building2 className="h-3 w-3 text-primary-foreground" /></div>
          <span className="font-bold text-background/80">RentFlow</span>
        </div>
        <p>© {new Date().getFullYear()} RentFlow. Built for landlords who value simplicity.</p>
      </footer>
  )
}