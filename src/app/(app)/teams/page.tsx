import Link from "next/link";
import { getGlobalData } from "@/lib/data";
import { EmployeeForm } from "@/components/forms/employee-form";
import { TeamDeleteButton } from "@/components/forms/team-delete-button";
import { TeamForm } from "@/components/forms/team-form";
import { MetricCard } from "@/components/metric-card";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function TeamsPage() {
  const data = await getGlobalData();
  const activeEmployees = data.employees.filter((employee) => employee.status === "active");

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Team Management"
        title="Create, staff, and monitor teams"
        description="Admin controls live here: team creation, employee assignment, staffing changes, and direct entry into team dashboards."
      />

      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Teams" value={data.teams.length} hint="Registered delivery groups" />
        <MetricCard label="Employees" value={data.employees.length} hint="Total headcount" />
        <MetricCard label="Active Employees" value={activeEmployees.length} hint="Currently available" />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="grid gap-6">
          {data.teams.map((team) => {
            const employees = data.employees.filter((employee) => employee.team_id === team.id);
            const projects = data.projects.filter((project) => project.team_id === team.id);
            return (
              <Card key={team.id} className="panel-glow border-white/10 bg-card/80">
                <CardHeader className="flex flex-row items-start justify-between gap-4">
                  <div>
                    <CardTitle className="text-2xl">{team.team_name}</CardTitle>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{team.description}</p>
                  </div>
                  <Badge variant="secondary">{projects.length} projects</Badge>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {employees.map((employee) => (
                      <Badge key={employee.id} variant="outline" className="rounded-full">
                        {employee.full_name}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Link href={`/teams/${team.id}`} className="text-sm text-primary hover:text-primary/80">
                      Open team detail
                    </Link>
                    <Link href={`/teams/${team.id}/dashboard`} className="text-sm text-primary hover:text-primary/80">
                      Team dashboard
                    </Link>
                    <Link href={`/teams/${team.id}/leaderboard`} className="text-sm text-primary hover:text-primary/80">
                      Team leaderboard
                    </Link>
                    <TeamDeleteButton teamId={team.id} teamName={team.team_name} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid gap-6">
          <TeamForm />
          <EmployeeForm teams={data.teams} />
        </div>
      </section>
    </div>
  );
}
