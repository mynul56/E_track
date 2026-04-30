import Link from "next/link";
import { AlertTriangle, ArrowRight } from "lucide-react";
import { getGlobalDashboardSummary, getGlobalData } from "@/lib/data";
import { MetricCard } from "@/components/metric-card";
import { PageHeader } from "@/components/page-header";
import { LeaderboardTable } from "@/components/leaderboard-table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";

export default async function DashboardPage() {
  const [{ metrics, leaderboard, alerts }, data] = await Promise.all([
    getGlobalDashboardSummary(),
    getGlobalData(),
  ]);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Global Command"
        title="Leadership dashboard across all teams"
        description="Track delivery health, update compliance, risk exposure, and performance ranking from one command surface."
        action={
          <Link href="/teams" className={buttonVariants()}>
            Open team workspace
          </Link>
        }
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="panel-glow border-white/10 bg-card/80">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Team directory</CardTitle>
            <Link href="/teams" className={buttonVariants({ variant: "ghost" })}>
              Manage teams
              <ArrowRight className="h-4 w-4" />
            </Link>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            {data.teams.map((team) => {
              const teamProjects = data.projects.filter((project) => project.team_id === team.id);
              const teamEmployees = data.employees.filter((employee) => employee.team_id === team.id);
              return (
                <Link
                  key={team.id}
                  href={`/teams/${team.id}/dashboard`}
                  className="rounded-3xl border border-white/10 bg-white/5 p-5 transition hover:border-primary/40 hover:bg-white/8"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold">{team.team_name}</h3>
                    <Badge variant="secondary">{teamEmployees.length} employees</Badge>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">{team.description}</p>
                  <div className="mt-5 flex items-center justify-between text-sm text-muted-foreground">
                    <span>{teamProjects.length} tracked projects</span>
                    <span>Open dashboard</span>
                  </div>
                </Link>
              );
            })}
          </CardContent>
        </Card>

        <Card className="panel-glow border-white/10 bg-card/80">
          <CardHeader>
            <CardTitle>Smart insights engine</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {alerts.map((alert) => (
              <div key={alert} className="flex gap-3 rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4">
                <AlertTriangle className="mt-0.5 h-4 w-4 text-amber-300" />
                <p className="text-sm leading-6 text-amber-50">{alert}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <PageHeader
          eyebrow="Performance"
          title="Cross-team leaderboard"
          description="Employees rank by combined consistency, progress, blocker handling, deadline discipline, quality, and collaboration."
        />
        <LeaderboardTable entries={leaderboard} />
      </section>
    </div>
  );
}
