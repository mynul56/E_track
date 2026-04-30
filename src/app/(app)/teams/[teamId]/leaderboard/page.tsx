import { notFound } from "next/navigation";
import { getTeamDashboardData } from "@/lib/data";
import { LeaderboardTable } from "@/components/leaderboard-table";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function TeamLeaderboardPage({
  params,
}: {
  params: Promise<{ teamId: string }>;
}) {
  const { teamId } = await params;
  const data = await getTeamDashboardData(teamId);
  if (!data) notFound();

  const entries = data.scores
    .sort((a, b) => b.total_score - a.total_score)
    .map((score, index) => ({
      rank: index + 1,
      score,
      employee: data.employees.find((employee) => employee.id === score.employee_id),
      team: data.team,
      lastUpdateDate: data.dailyUpdates.filter((update) => update.employee_id === score.employee_id).at(-1)?.date ?? null,
    }));

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Team Leaderboard"
        title={`${data.team.team_name} performance ranking`}
        description="Highest total score comes first, with consistency and progress used as tie-breakers."
      />

      <Card className="panel-glow border-white/10 bg-card/80">
        <CardHeader>
          <CardTitle>Leaderboard table</CardTitle>
        </CardHeader>
        <CardContent>
          <LeaderboardTable entries={entries} />
        </CardContent>
      </Card>
    </div>
  );
}
