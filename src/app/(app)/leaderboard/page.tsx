import { getGlobalData, getLeaderboard } from "@/lib/data";
import { LeaderboardTable } from "@/components/leaderboard-table";
import { MetricCard } from "@/components/metric-card";
import { PageHeader } from "@/components/page-header";

export default async function LeaderboardPage() {
  const data = await getGlobalData();
  const entries = getLeaderboard(data);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Leaderboard"
        title="Organization-wide employee ranking"
        description="Employees are ranked by total score descending, then update consistency, then progress contribution."
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Top Score" value={entries[0]?.score.total_score ?? 0} hint={entries[0]?.employee?.full_name ?? "No entries"} />
        <MetricCard label="Average Score" value={Math.round(data.scores.reduce((sum, score) => sum + score.total_score, 0) / data.scores.length)} hint="Across all employees" />
        <MetricCard label="This Week" value={entries.filter((entry) => entry.score.trend === "up").length} hint="Employees trending upward" />
        <MetricCard label="This Month" value={data.scoreHistory.length} hint="Logged score changes" />
      </section>

      <LeaderboardTable entries={entries} />
    </div>
  );
}
