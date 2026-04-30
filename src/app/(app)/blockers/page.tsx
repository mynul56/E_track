import { getGlobalData } from "@/lib/data";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function BlockersPage() {
  const data = await getGlobalData();

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Blocker Management"
        title="Team blocker control center"
        description="View blockers by team, filter mentally by severity, and spot repeated operational friction points."
      />

      <div className="grid gap-6">
        {data.teams.map((team) => {
          const blockers = data.blockers.filter((blocker) => blocker.team_id === team.id);
          return (
            <Card key={team.id} className="panel-glow border-white/10 bg-card/80">
              <CardHeader>
                <CardTitle>{team.team_name}</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                {blockers.map((blocker) => (
                  <div key={blocker.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="font-medium">{blocker.description}</p>
                      <div className="flex gap-2">
                        <Badge variant="outline">{blocker.severity}</Badge>
                        <Badge variant={blocker.status === "open" ? "destructive" : "secondary"}>{blocker.status}</Badge>
                      </div>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Employee: {data.employees.find((employee) => employee.id === blocker.employee_id)?.full_name}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
