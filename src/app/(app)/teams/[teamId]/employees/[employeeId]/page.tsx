import { notFound } from "next/navigation";
import { getEmployeeProfileData } from "@/lib/data";
import { ScoreAdjustmentForm } from "@/components/forms/score-adjustment-form";
import { MetricCard } from "@/components/metric-card";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function EmployeeProfilePage({
  params,
}: {
  params: Promise<{ teamId: string; employeeId: string }>;
}) {
  const { teamId, employeeId } = await params;
  const data = await getEmployeeProfileData(teamId, employeeId);
  if (!data) notFound();

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Employee Profile"
        title={data.employee.full_name}
        description={`${data.employee.employee_code} · ${data.team.team_name} · ${data.employee.role}`}
        status={data.employee.status}
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Current Score" value={data.score?.total_score ?? 0} hint="Combined leaderboard score" />
        <MetricCard label="Contribution %" value={data.contributionPercent} hint="Share of logged progress" />
        <MetricCard label="Missed Updates" value={data.missedUpdates} hint="Recent missing daily submissions" />
        <MetricCard label="Open Blockers" value={data.blockers.filter((blocker) => blocker.status === "open").length} hint="Current blocker load" />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_0.85fr]">
        <Card className="panel-glow border-white/10 bg-card/80">
          <CardHeader>
            <CardTitle>Score breakdown</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <Widget label="Progress score" value={data.score?.progress_score ?? 0} />
            <Widget label="Consistency score" value={data.score?.update_consistency_score ?? 0} />
            <Widget label="Blocker score" value={data.score?.blocker_resolution_score ?? 0} />
            <Widget label="Deadline score" value={data.score?.deadline_score ?? 0} />
            <Widget label="Quality score" value={data.score?.quality_score ?? 0} />
            <Widget label="Collaboration score" value={data.score?.collaboration_score ?? 0} />
            <Widget label="Missed update penalty" value={data.scoreSnapshot.missedUpdatePenalty} />
            <Widget label="Deadline penalty" value={data.scoreSnapshot.deadlinePenalty} />
          </CardContent>
        </Card>

        <ScoreAdjustmentForm employee={data.employee} team={data.team} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card className="panel-glow border-white/10 bg-card/80">
          <CardHeader>
            <CardTitle>Strengths & weak areas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-primary">Strengths</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {data.scoreSnapshot.strengths.map((item) => (
                  <Badge key={item} variant="outline">
                    {item}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-amber-300">Weak areas</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {data.scoreSnapshot.weakAreas.map((item) => (
                  <Badge key={item} variant="secondary">
                    {item}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="font-medium">Assigned projects</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {data.projects.map((project) => (
                  <Badge key={project.id} variant="outline">
                    {project.project_name}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="panel-glow border-white/10 bg-card/80">
          <CardHeader>
            <CardTitle>Score history</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-white/10 hover:bg-transparent">
                  <TableHead>Date</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Before</TableHead>
                  <TableHead>After</TableHead>
                  <TableHead>Change</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.scoreHistory.map((item) => (
                  <TableRow key={item.id} className="border-white/10 hover:bg-white/5">
                    <TableCell>{new Date(item.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>{item.reason}</TableCell>
                    <TableCell>{item.score_before}</TableCell>
                    <TableCell>{item.score_after}</TableCell>
                    <TableCell>{item.score_change >= 0 ? `+${item.score_change}` : item.score_change}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function Widget({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
      <p className="mt-2 text-xl font-semibold">{value}</p>
    </div>
  );
}
