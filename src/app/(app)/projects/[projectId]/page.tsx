import { notFound } from "next/navigation";
import { getProjectDetailData } from "@/lib/data";
import { MetricCard } from "@/components/metric-card";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const data = await getProjectDetailData(projectId);
  if (!data) notFound();

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Project Dashboard"
        title={data.project.project_name}
        description={`${data.team.team_name} · ${data.client?.company_name ?? "Unknown client"} · ${data.project.order_id}`}
        status={data.project.status}
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Progress" value={`${data.project.progress}%`} hint="Current completion level" />
        <MetricCard label="Milestone Rate" value={`${data.milestoneRate}%`} hint="Milestone completion" />
        <MetricCard label="Deadline Risk" value={data.deadlineRisk} hint="Risk summary" />
        <MetricCard label="Assigned Employees" value={data.employees.length} hint="Current staffing" />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Card className="panel-glow border-white/10 bg-card/80">
          <CardHeader>
            <CardTitle>Assigned employees</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {data.employees.map((employee) => (
              <Badge key={employee.id} variant="outline">
                {employee.full_name}
              </Badge>
            ))}
          </CardContent>
        </Card>

        <Card className="panel-glow border-white/10 bg-card/80">
          <CardHeader>
            <CardTitle>Client details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>Client contact: {data.client?.client_name}</p>
            <p>Company: {data.client?.company_name}</p>
            <p>Contact info: {data.client?.contact_info}</p>
            <p>Priority: {data.project.priority}</p>
            <p>Risk level: {data.project.risk_level}</p>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="panel-glow border-white/10 bg-card/80">
          <CardHeader>
            <CardTitle>Update history</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.updates.map((update) => (
              <div key={update.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium">{new Date(update.date).toLocaleDateString()}</p>
                  <Badge variant="secondary">{update.progress_percentage}%</Badge>
                </div>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{update.notes || update.client_status}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {update.next_actions.map((item) => (
                    <Badge key={item} variant="outline">
                      {item}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="panel-glow border-white/10 bg-card/80">
          <CardHeader>
            <CardTitle>Blockers & milestones</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="font-medium">Milestone progress</p>
              <p className="mt-2 text-sm text-muted-foreground">
                {data.project.current_milestone} of {data.project.total_milestones} milestones completed.
              </p>
            </div>
            {data.blockers.map((blocker) => (
              <div key={blocker.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{blocker.description}</p>
                  <Badge variant={blocker.status === "open" ? "destructive" : "secondary"}>{blocker.status}</Badge>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Severity: {blocker.severity} · Created {new Date(blocker.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
