import { ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function MetricCard({
  label,
  value,
  hint,
  delta,
}: {
  label: string;
  value: string | number;
  hint: string;
  delta?: string;
}) {
  return (
    <Card className="panel-glow border-white/10 bg-card/80">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-3xl font-semibold tracking-tight">{value}</p>
            <p className="mt-2 text-sm text-muted-foreground">{hint}</p>
          </div>
          {delta ? (
            <div className="flex items-center gap-1 rounded-full bg-white/5 px-3 py-1 text-xs text-primary">
              <ArrowRight className="h-3.5 w-3.5" />
              {delta}
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
