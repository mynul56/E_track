import Link from "next/link";
import { notFound } from "next/navigation";
import { getTeamDashboardData } from "@/lib/data";
import { EmployeeForm } from "@/components/forms/employee-form";
import { TeamDeleteButton } from "@/components/forms/team-delete-button";
import { MetricCard } from "@/components/metric-card";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function TeamDetailPage({
  params,
}: {
  params: Promise<{ teamId: string }>;
}) {
  const { teamId } = await params;
  const data = await getTeamDashboardData(teamId);
  if (!data) notFound();

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Team Workspace"
        title={data.team.team_name}
        description={data.team.description}
        action={
          <div className="flex gap-3">
            <Link href={`/teams/${teamId}/dashboard`} className="text-sm text-primary hover:text-primary/80">
              Analytics dashboard
            </Link>
            <Link href={`/teams/${teamId}/leaderboard`} className="text-sm text-primary hover:text-primary/80">
              Score leaderboard
            </Link>
            <TeamDeleteButton teamId={data.team.id} teamName={data.team.team_name} redirectToTeams />
          </div>
        }
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {data.metrics.slice(0, 4).map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <Card className="panel-glow border-white/10 bg-card/80">
          <CardHeader>
            <CardTitle>Employees</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.employees.map((employee) => {
              const employeeProjects = data.projects.filter((project) =>
                project.id && data.dailyUpdates.some((update) => update.employee_id === employee.id && update.project_id === project.id),
              );
              return (
                <div key={employee.id} className="rounded-3xl border border-white/10 bg-white/5 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold">{employee.full_name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {employee.employee_code} · {employee.role}
                      </p>
                    </div>
                    <Badge variant={employee.status === "active" ? "default" : "secondary"}>{employee.status}</Badge>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {employeeProjects.map((project) => (
                      <Badge key={project.id} variant="outline">
                        {project.project_name}
                      </Badge>
                    ))}
                  </div>
                  <div className="mt-4 flex flex-wrap gap-3 text-sm">
                    <Link href={`/teams/${teamId}/employees/${employee.id}`} className="text-primary hover:text-primary/80">
                      View profile
                    </Link>
                    <Link href={`/teams/${teamId}/employees/${employee.id}/paste-update`} className="text-primary hover:text-primary/80">
                      Paste update
                    </Link>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <EmployeeForm teams={[data.team]} defaultTeamId={data.team.id} />
      </section>
    </div>
  );
}
