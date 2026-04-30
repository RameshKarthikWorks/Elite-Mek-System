import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: ReactNode;
  };
  children?: ReactNode;
}

export function PageHeader({ title, subtitle, action, children }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
        {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-2">
        {children}
        {action && (
          <Button onClick={action.onClick} data-testid={`action-${title.toLowerCase().replace(/\s+/g, '-')}`}>
            {action.icon || <Plus className="mr-2 h-4 w-4" />}
            {action.label}
          </Button>
        )}
      </div>
    </div>
  );
}
