import logoUrl from "@/assets/elite-mek-logo.png";

interface ReportHeaderProps {
  title: string;
  subtitle?: string;
  dateRange?: string;
}

export function ReportHeader({ title, subtitle, dateRange }: ReportHeaderProps) {
  return (
    <div className="print-header mb-8 pb-4 border-b-2 border-primary hidden print:block">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <img src={logoUrl} alt="Elite Mek" className="w-16 h-16 object-contain" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground uppercase">ELITE MEK ENGINEERING</h1>
            <p className="text-sm text-muted-foreground">123 Industrial Park, Block A, Engineering City</p>
            <p className="text-sm text-muted-foreground">GSTIN: 29ABCDE1234F1Z5 | contact@elitemek.com</p>
          </div>
        </div>
        <div className="text-right">
          <h2 className="text-xl font-semibold uppercase">{title}</h2>
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
          {dateRange && <p className="text-sm font-medium mt-2">Date: {dateRange}</p>}
          <p className="text-xs text-muted-foreground mt-1">Generated on: {new Date().toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}
