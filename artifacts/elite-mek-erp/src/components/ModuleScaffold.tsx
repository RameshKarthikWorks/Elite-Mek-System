import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Wrench } from "lucide-react";

export function ModuleScaffold({ title, description }: { title: string; description?: string }) {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
      </div>
      
      <div className="flex h-[450px] shrink-0 items-center justify-center rounded-md border border-dashed">
        <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
            <Wrench className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="mt-4 text-lg font-semibold">Coming Soon</h3>
          <p className="mb-4 mt-2 text-sm text-muted-foreground">
            {description || `The ${title} module is currently under development. Please check back later.`}
          </p>
          <div className="text-left text-sm text-muted-foreground mt-4 w-full">
            <p className="font-medium text-foreground mb-2">Planned features:</p>
            <ul className="list-disc pl-4 space-y-1">
              <li>Complete CRUD operations</li>
              <li>Advanced filtering and search</li>
              <li>Role-based access control</li>
              <li>Export to PDF and Excel</li>
              <li>Audit logging</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
