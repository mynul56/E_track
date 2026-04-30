import Link from "next/link";
import { notFound } from "next/navigation";
import { Trophy } from "lucide-react";
import { getTeamDashboardData } from "@/lib/data";
import { LeaderboardTable } from "@/components/leaderboard-table";
import { MetricCard } from "@/components/metric-card";
import { PageHeader } from "@/components/page-header";
import { TeamDashboardCharts } from "@/components/charts/team-dashboard-charts";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function TeamDashboardPage({
  params,
}: {
  params: Promise<{ teamId: string }>;
}) {
  const { teamId } = await params;
  const data = await getTeamDashboardData(teamId);
  if (!data) notFound();

  const leaderboard = data.scores
    .sort((a, b) => b.total_score - a.total_score)
    .map((score, index) => ({
      rank: index + 1,
      score,
      employee: data.employees.find((employee) => employee.id === score.employee_id),
      team: data.team,
      lastUpdateDate: data.dailyUpdates
        .filter((update) => update.employee_id === score.employee_id)
        .at(-1)?.date ?? null,
    }));

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Team Dashboard"
        title={`${data.team.team_name} analytics`}
        description="Operational visibility across progress, blockers, update compliance, workload, and performance score trends."
        action={
          <Link href={`/teams/${teamId}`} className="text-sm text-primary hover:text-primary/80">
            Back to team workspace
          </Link>
        }
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {data.metrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-4">
        <Card className="panel-glow border-white/10 bg-card/80 xl:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-primary" />
              Score widgets
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <Widget label="Top performer" value={data.topPerformer ? `${data.employees.find((employee) => employee.id === data.topPerformer?.employee_id)?.full_name} · ${data.topPerformer.total_score}` : "N/A"} />
            <Widget label="Lowest score" value={data.lowestPerformer ? `${data.employees.find((employee) => employee.id === data.lowestPerformer?.employee_id)?.full_name} · ${data.lowestPerformer.total_score}` : "N/A"} />
            <Widget label="Average score" value={`${data.averageScore}`} />
            <Widget label="Vs last week" value={`${data.scoreChangeVsLastWeek >= 0 ? "+" : ""}${data.scoreChangeVsLastWeek}`} />
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="font-medium">Missing updates</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {data.missingUpdates.length
                  ? data.missingUpdates.map((employee) => (
                      <Badge key={employee.id} variant="outline">
                        {employee.full_name}
                      </Badge>
                    ))
                  : "No missing updates today"}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="panel-glow border-white/10 bg-card/80 xl:col-span-3">
          <CardHeader>
            <CardTitle>Alert banner stream</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            {data.alerts.map((alert) => (
              <div key={alert} className="rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4 text-sm text-amber-50">
                {alert}
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <TeamDashboardCharts charts={data.charts} />

      <section className="space-y-4">
        <PageHeader
          eyebrow="Leaderboard"
          title="Ranked employee performance"
          description="Sorted by total score first, then update consistency, then progress contribution."
        />
        <LeaderboardTable entries={leaderboard} />
      </section>
    </div>
  );
}

function Widget({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
      <p className="mt-2 text-base font-semibold text-foreground">{value}</p>
    </div>
  );
}
