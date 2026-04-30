import { Wrench, Sparkles } from "lucide-react";

export function ModuleScaffold({
  title,
  description,
  plannedFeatures,
}: {
  title: string;
  description?: string;
  plannedFeatures?: string[];
}) {
  const features = plannedFeatures && plannedFeatures.length > 0
    ? plannedFeatures
    : [
        "Complete CRUD operations",
        "Advanced filtering and search",
        "Role-based access control",
        "Export to PDF and Excel",
        "Audit logging",
      ];

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight" data-testid={`text-title-${title}`}>{title}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {description || `The ${title} module is part of the Elite Mek ERP roadmap.`}
          </p>
        </div>
      </div>

      <div className="rounded-xl border bg-gradient-to-br from-primary/5 via-card to-card overflow-hidden">
        <div className="grid md:grid-cols-2 gap-0">
          <div className="p-8 md:p-10 flex flex-col justify-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-medium w-fit">
              <Sparkles className="h-3 w-3" />
              Module Scaffold
            </div>
            <h3 className="mt-4 text-2xl font-semibold tracking-tight">{title}</h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              This module is scaffolded and ready for implementation. The data model, navigation
              entry, and access control hooks are already in place — full CRUD will be wired in
              the next iteration.
            </p>
          </div>
          <div className="p-8 md:p-10 bg-muted/30 border-t md:border-t-0 md:border-l">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <Wrench className="h-4 w-4" />
              </div>
              <p className="font-semibold text-sm">Planned features</p>
            </div>
            <ul className="space-y-2.5">
              {features.map((feat, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
