import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: ReactNode;
  };
  actions?: ReactNode;
  children?: ReactNode;
}

export function PageHeader({ title, subtitle, description, action, actions, children }: PageHeaderProps) {
  const sub = subtitle || description;
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
        {sub && <p className="text-sm text-muted-foreground mt-1">{sub}</p>}
      </div>
      <div className="flex items-center gap-2">
        {children}
        {actions}
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
