import { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
  status,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
  status?: string;
}) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div className="max-w-3xl">
        <p className="text-xs uppercase tracking-[0.26em] text-primary">{eyebrow}</p>
        <div className="mt-3 flex items-center gap-3">
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">{title}</h1>
          {status ? (
            <Badge variant="secondary" className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs">
              {status}
            </Badge>
          ) : null}
        </div>
        <p className="mt-3 text-base leading-7 text-muted-foreground">{description}</p>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
