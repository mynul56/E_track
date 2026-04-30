import Link from "next/link";
import { ArrowDownRight, ArrowRight, ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export function LeaderboardTable({
  entries,
}: {
  entries: Array<{
    rank: number;
    score: {
      employee_id: string;
      total_score: number;
      progress_score: number;
      update_consistency_score: number;
      blocker_resolution_score: number;
      deadline_score: number;
      quality_score: number;
      trend: "up" | "down" | "same";
    };
    employee?: {
      id: string;
      full_name: string;
      employee_code: string;
      team_id: string;
      role: string;
    };
    team?: {
      id: string;
      team_name: string;
    };
    lastUpdateDate: string | null;
  }>;
}) {
  return (
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-card/80">
      <Table>
        <TableHeader>
          <TableRow className="border-white/10 hover:bg-transparent">
            <TableHead>Rank</TableHead>
            <TableHead>Employee</TableHead>
            <TableHead>Team</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Progress</TableHead>
            <TableHead>Consistency</TableHead>
            <TableHead>Blocker</TableHead>
            <TableHead>Deadline</TableHead>
            <TableHead>Quality</TableHead>
            <TableHead>Trend</TableHead>
            <TableHead>Last Update</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.map((entry) => (
            <TableRow key={entry.score.employee_id} className="border-white/10 hover:bg-white/5">
              <TableCell className="font-medium">#{entry.rank}</TableCell>
              <TableCell>
                {entry.employee ? (
                  <Link
                    href={`/teams/${entry.employee.team_id}/employees/${entry.employee.id}`}
                    className="font-medium text-foreground hover:text-primary"
                  >
                    {entry.employee.full_name}
                  </Link>
                ) : (
                  "Unknown"
                )}
                <div className="text-xs text-muted-foreground">{entry.employee?.employee_code}</div>
              </TableCell>
              <TableCell>{entry.team?.team_name ?? "Unknown"}</TableCell>
              <TableCell className="font-semibold">{entry.score.total_score}</TableCell>
              <TableCell>{entry.score.progress_score}</TableCell>
              <TableCell>{entry.score.update_consistency_score}</TableCell>
              <TableCell>{entry.score.blocker_resolution_score}</TableCell>
              <TableCell>{entry.score.deadline_score}</TableCell>
              <TableCell>{entry.score.quality_score}</TableCell>
              <TableCell>
                <Badge
                  className={cn(
                    "gap-1 rounded-full border border-white/10 bg-white/5",
                    entry.score.trend === "up" && "text-emerald-300",
                    entry.score.trend === "down" && "text-rose-300",
                  )}
                >
                  {entry.score.trend === "up" ? (
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  ) : entry.score.trend === "down" ? (
                    <ArrowDownRight className="h-3.5 w-3.5" />
                  ) : (
                    <ArrowRight className="h-3.5 w-3.5" />
                  )}
                  {entry.score.trend}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {entry.lastUpdateDate ? new Date(entry.lastUpdateDate).toLocaleDateString() : "No update"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
