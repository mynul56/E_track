import { differenceInCalendarDays, isAfter, isBefore, isSameDay, parseISO } from "date-fns";
import type { DailyUpdate, Employee, EmployeeScore, Project, ScoreSnapshot, Trend } from "@/lib/types";

export function getScoreTrend(current: number, previous: number): Trend {
  if (current > previous) return "up";
  if (current < previous) return "down";
  return "same";
}

export function calculateEmployeeScore(
  employee: Employee,
  updates: DailyUpdate[],
  projects: Project[],
  previousScore?: EmployeeScore,
) {
  const sortedUpdates = [...updates].sort((a, b) => a.date.localeCompare(b.date));
  const todayUpdate = sortedUpdates.at(-1);
  const consistencyScore = Math.max(
    0,
    sortedUpdates.reduce((score, update, index) => {
      const previous = sortedUpdates[index - 1];
      const streakBonus =
        previous && differenceInCalendarDays(parseISO(update.date), parseISO(previous.date)) === 1 && index >= 4
          ? 15
          : 0;
      return score + 5 + streakBonus;
    }, 0) - (todayUpdate ? 0 : 5),
  );

  const progressScore = sortedUpdates.reduce((score, update, index) => {
    const previous = sortedUpdates[index - 1];
    if (!previous) return score + 10;
    if (update.progress_percentage > previous.progress_percentage) return score + 10;
    if (update.progress_percentage === previous.progress_percentage) {
      return score - (index >= 2 ? 10 : 5);
    }
    return score;
  }, 0);

  const blockerResolutionScore = sortedUpdates.reduce((score, update) => {
    const repeatedBlockerPenalty = update.blockers.length >= 2 ? -8 : 0;
    return score + update.blockers.length * 3 + repeatedBlockerPenalty;
  }, 0);

  const deadlineScore = projects.reduce((score, project) => {
    const deadline = parseISO(project.deadline);
    const isComplete = project.status === "completed";
    if (isComplete && isBefore(deadline, todayUpdate ? parseISO(todayUpdate.date) : new Date())) return score + 10;
    if (isComplete) return score + 20;
    if (project.risk_level === "critical" && !todayUpdate) return score - 10;
    if (isAfter(new Date(), deadline) && project.status !== "blocked") return score - 15;
    return score;
  }, 0);

  const qualityScore = sortedUpdates.reduce((score, update) => score + update.quality_rating * 2, 0);
  const collaborationScore = sortedUpdates.reduce((score, update) => {
    if (update.client_status.toLowerCase().includes("attended")) return score + 5;
    if (update.client_status.toLowerCase().includes("waiting")) return score + 3;
    if (update.client_status.toLowerCase().includes("complaint")) return score - 10;
    return score + 2;
  }, 0);

  const totalScore =
    consistencyScore +
    progressScore +
    blockerResolutionScore +
    deadlineScore +
    qualityScore +
    collaborationScore;

  return {
    employee_id: employee.id,
    team_id: employee.team_id,
    total_score: totalScore,
    progress_score: progressScore,
    update_consistency_score: consistencyScore,
    blocker_resolution_score: blockerResolutionScore,
    deadline_score: deadlineScore,
    quality_score: qualityScore,
    collaboration_score: collaborationScore,
    trend: getScoreTrend(totalScore, previousScore?.total_score ?? totalScore),
  };
}

export function buildScoreSnapshot(score: EmployeeScore | null, updates: DailyUpdate[], projects: Project[]): ScoreSnapshot {
  const missedUpdatePenalty = updates.length < 5 ? (5 - updates.length) * 5 : 0;
  const blockerPenalty = updates.filter((update) => update.blockers.length > 1).length * 8;
  const deadlinePenalty = projects.filter(
    (project) => project.status !== "completed" && isBefore(parseISO(project.deadline), new Date()),
  ).length * 15;

  return {
    strengths: [
      score && score.update_consistency_score > 25 ? "Consistent update discipline" : "Needs tighter update rhythm",
      score && score.progress_score > 25 ? "Moves work forward regularly" : "Progress growth is uneven",
    ],
    weakAreas: [
      blockerPenalty > 0 ? "Repeated blockers need faster escalation" : "Blocker handling is stable",
      deadlinePenalty > 0 ? "Deadline discipline needs intervention" : "Deadlines are mostly under control",
    ],
    missedUpdatePenalty,
    blockerPenalty,
    deadlinePenalty,
  };
}

export function didSubmitToday(updates: DailyUpdate[]) {
  return updates.some((update) => isSameDay(parseISO(update.date), new Date("2026-04-30T09:00:00.000Z")));
}
