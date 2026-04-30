import { differenceInCalendarDays, format, isAfter, isBefore, isSameDay, parseISO, subDays } from "date-fns";
import { demoData } from "@/lib/demo-data";
import { buildScoreSnapshot, calculateEmployeeScore, didSubmitToday } from "@/lib/scoring";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
  DailyUpdate,
  Employee,
  EmployeeProfileData,
  EmployeeScore,
  GlobalDashboardData,
  Project,
  ProjectDetailData,
  TeamDashboardData,
} from "@/lib/types";

async function fetchSupabaseSnapshot(): Promise<GlobalDashboardData | null> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  const [teams, employees, projects, updates, blockers, clients, scores, scoreHistory] = await Promise.all([
    supabase.from("teams").select("*").order("created_at"),
    supabase.from("employees").select("*").order("created_at"),
    supabase.from("projects").select("*").order("created_at"),
    supabase.from("daily_updates").select("*").order("date"),
    supabase.from("blockers").select("*").order("created_at"),
    supabase.from("clients").select("*").order("created_at"),
    supabase.from("employee_scores").select("*").order("total_score", { ascending: false }),
    supabase.from("score_history").select("*").order("created_at"),
  ]);

  const hasError = [teams, employees, projects, updates, blockers, clients, scores, scoreHistory].some(
    (result) => result.error,
  );

  if (hasError) return null;

  return {
    teams: teams.data ?? [],
    employees: employees.data ?? [],
    projects: projects.data ?? [],
    updates: (updates.data as DailyUpdate[]) ?? [],
    blockers: blockers.data ?? [],
    clients: clients.data ?? [],
    scores: (scores.data as EmployeeScore[]) ?? [],
    scoreHistory: scoreHistory.data ?? [],
  };
}

export async function getGlobalData(): Promise<GlobalDashboardData & { projectEmployees: typeof demoData.projectEmployees }> {
  const snapshot = await fetchSupabaseSnapshot();
  return snapshot ? { ...snapshot, projectEmployees: demoData.projectEmployees } : demoData;
}

function getEmployeeProjects(employeeId: string, projects: Project[]) {
  const assignedProjectIds = demoData.projectEmployees
    .filter((entry) => entry.employee_id === employeeId)
    .map((entry) => entry.project_id);

  return projects.filter((project) => assignedProjectIds.includes(project.id));
}

export async function getGlobalDashboardSummary() {
  const data = await getGlobalData();
  const today = new Date("2026-04-30T09:00:00.000Z");
  const activeProjects = data.projects.filter((project) => project.status !== "completed");
  const delayedProjects = data.projects.filter(
    (project) => project.status === "delayed" || isBefore(parseISO(project.deadline), today),
  );
  const highRiskProjects = data.projects.filter((project) => ["high", "critical"].includes(project.risk_level));

  return {
    metrics: [
      { label: "Teams", value: data.teams.length, hint: "Active delivery units", delta: "+1 this quarter" },
      { label: "Employees", value: data.employees.length, hint: "Tracked contributors", delta: "4 active today" },
      { label: "Active Projects", value: activeProjects.length, hint: "Open client work", delta: `${delayedProjects.length} delayed` },
      { label: "High Risk", value: highRiskProjects.length, hint: "Need leadership attention", delta: "Escalate within 24h" },
    ],
    leaderboard: getLeaderboard(data),
    alerts: buildAlerts(data),
  };
}

function buildAlerts(data: GlobalDashboardData) {
  const alerts: string[] = [];
  data.projects.forEach((project) => {
    const recent = data.updates
      .filter((update) => update.project_id === project.id)
      .sort((a, b) => b.date.localeCompare(a.date));
    if (recent.length >= 2 && recent[0].progress_percentage === recent[1].progress_percentage) {
      alerts.push(`${project.project_name}: progress stagnated for 2 updates.`);
    }
    if (
      differenceInCalendarDays(parseISO(project.deadline), new Date("2026-04-30T09:00:00.000Z")) <= 7 &&
      project.progress < 60
    ) {
      alerts.push(`${project.project_name}: deadline is near but progress is still low.`);
    }
  });

  const repeatedBlockers = data.blockers.filter(
    (blocker) =>
      data.updates.filter(
        (update) => update.blockers.some((description) => description.toLowerCase() === blocker.description.toLowerCase()),
      ).length >= 3,
  );

  if (repeatedBlockers.length > 0) {
    alerts.push("Repeated blockers detected across multiple days.");
  }

  data.employees.forEach((employee) => {
    const employeeUpdates = data.updates.filter((update) => update.employee_id === employee.id);
    const latest = employeeUpdates.at(-1);
    if (latest && differenceInCalendarDays(new Date("2026-04-30T09:00:00.000Z"), parseISO(latest.date)) >= 2) {
      alerts.push(`${employee.full_name}: missed updates for 2+ days.`);
    }
  });

  return alerts;
}

export function getLeaderboard(data: GlobalDashboardData) {
  return [...data.scores]
    .sort((a, b) => {
      if (b.total_score !== a.total_score) return b.total_score - a.total_score;
      if (b.update_consistency_score !== a.update_consistency_score) {
        return b.update_consistency_score - a.update_consistency_score;
      }
      return b.progress_score - a.progress_score;
    })
    .map((score, index) => {
      const employee = data.employees.find((entry) => entry.id === score.employee_id);
      const team = data.teams.find((entry) => entry.id === score.team_id);
      const updates = data.updates.filter((update) => update.employee_id === score.employee_id);
      return {
        rank: index + 1,
        score,
        employee,
        team,
        lastUpdateDate: updates.at(-1)?.date ?? null,
      };
    });
}

export async function getTeamDashboardData(teamId: string): Promise<TeamDashboardData | null> {
  const data = await getGlobalData();
  const team = data.teams.find((entry) => entry.id === teamId);
  if (!team) return null;

  const employees = data.employees.filter((entry) => entry.team_id === teamId);
  const projects = data.projects.filter((entry) => entry.team_id === teamId);
  const dailyUpdates = data.updates.filter((entry) => entry.team_id === teamId);
  const blockers = data.blockers.filter((entry) => entry.team_id === teamId);
  const clients = data.clients.filter((client) => projects.some((project) => project.client_id === client.id));
  const scores = data.scores.filter((entry) => entry.team_id === teamId);
  const today = new Date("2026-04-30T09:00:00.000Z");

  const missingUpdates = employees.filter((employee) => {
    const employeeUpdates = dailyUpdates.filter((update) => update.employee_id === employee.id);
    return employee.status === "active" && !employeeUpdates.some((update) => isSameDay(parseISO(update.date), today));
  });

  const metrics = [
    { label: "Total Employees", value: employees.length, hint: "Active team members" },
    { label: "Active Projects", value: projects.filter((project) => project.status !== "completed").length, hint: "In-flight delivery" },
    { label: "Completed Projects", value: projects.filter((project) => project.status === "completed").length, hint: "Finished successfully" },
    { label: "Blocked Projects", value: projects.filter((project) => project.status === "blocked").length, hint: "Need intervention" },
    { label: "Delayed Projects", value: projects.filter((project) => project.status === "delayed").length, hint: "Deadline drift" },
    { label: "High Risk Projects", value: projects.filter((project) => ["high", "critical"].includes(project.risk_level)).length, hint: "Executive watchlist" },
    { label: "Updates Submitted Today", value: dailyUpdates.filter((update) => isSameDay(parseISO(update.date), today)).length, hint: "Today coverage" },
    { label: "Missing Updates Today", value: missingUpdates.length, hint: "Follow-up required" },
  ];

  const topPerformer = [...scores].sort((a, b) => b.total_score - a.total_score)[0] ?? null;
  const lowestPerformer = [...scores].sort((a, b) => a.total_score - b.total_score)[0] ?? null;
  const averageScore = scores.length ? Math.round(scores.reduce((sum, item) => sum + item.total_score, 0) / scores.length) : 0;
  const scoreChangeVsLastWeek =
    scores.reduce((sum, item) => sum + item.total_score, 0) -
    scores.reduce((sum, item) => {
      const historic = data.scoreHistory.find((history) => history.employee_id === item.employee_id);
      return sum + (historic?.score_before ?? item.total_score);
    }, 0);

  const progressTimeline = Array.from({ length: 7 }).map((_, index) => {
    const day = subDays(today, 6 - index);
    const updates = dailyUpdates.filter((update) => isSameDay(parseISO(update.date), day));
    const avgProgress = updates.length
      ? Math.round(updates.reduce((sum, update) => sum + update.progress_percentage, 0) / updates.length)
      : 0;
    return { date: format(day, "MMM d"), progress: avgProgress };
  });

  const employeeContribution = employees.map((employee) => {
    const updates = dailyUpdates.filter((update) => update.employee_id === employee.id);
    return {
      employee: employee.full_name.split(" ")[0],
      updates: updates.length,
      progress: Math.round(updates.reduce((sum, update) => sum + update.progress_percentage, 0) / Math.max(updates.length, 1)),
    };
  });

  const projectDistribution = projects.map((project) => ({
    project: project.project_name.split(" ")[0],
    progress: project.progress,
    milestones: project.current_milestone,
  }));

  const riskDistribution = ["low", "medium", "high", "critical"].map((risk) => ({
    name: risk,
    value: projects.filter((project) => project.risk_level === risk).length,
  }));

  const priorityDistribution = ["low", "medium", "high", "critical"].map((priority) => ({
    name: priority,
    value: projects.filter((project) => project.priority === priority).length,
  }));

  const dailyActivity = progressTimeline.map((entry) => ({
    date: entry.date,
    updates: dailyUpdates.filter((update) => format(parseISO(update.date), "MMM d") === entry.date).length,
  }));

  const blockersTrend = progressTimeline.map((entry) => ({
    date: entry.date,
    blockers: dailyUpdates.filter(
      (update) => format(parseISO(update.date), "MMM d") === entry.date && update.blockers.length > 0,
    ).length,
  }));

  const deadlineRiskChart = projects.map((project) => ({
    project: project.project_name.split(" ")[0],
    daysLeft: differenceInCalendarDays(parseISO(project.deadline), today),
    progress: project.progress,
  }));

  const workloadDistribution = employees.map((employee) => ({
    employee: employee.full_name.split(" ")[0],
    projects: getEmployeeProjects(employee.id, projects).length,
  }));

  const milestoneCompletion = projects.map((project) => ({
    project: project.project_name.split(" ")[0],
    rate: Math.round((project.current_milestone / project.total_milestones) * 100),
  }));

  const scoreDistribution = employees.map((employee) => {
    const score = scores.find((entry) => entry.employee_id === employee.id);
    return { employee: employee.full_name.split(" ")[0], score: score?.total_score ?? 0 };
  });

  const scoreTrend = employees.flatMap((employee) => {
    const history = data.scoreHistory.filter((entry) => entry.employee_id === employee.id).slice(-3);
    return history.map((entry) => ({
      point: `${employee.full_name.split(" ")[0]} ${format(parseISO(entry.created_at), "MMM d")}`,
      score: entry.score_after,
    }));
  });

  return {
    team,
    employees,
    projects,
    dailyUpdates,
    blockers,
    clients,
    scores,
    metrics,
    missingUpdates,
    topPerformer,
    lowestPerformer,
    averageScore,
    scoreChangeVsLastWeek,
    charts: {
      progressTimeline,
      employeeContribution,
      projectDistribution,
      riskDistribution,
      priorityDistribution,
      dailyActivity,
      blockersTrend,
      deadlineRiskChart,
      workloadDistribution,
      milestoneCompletion,
      scoreDistribution,
      scoreTrend,
    },
    alerts: buildAlerts({
      teams: [team],
      employees,
      projects,
      updates: dailyUpdates,
      blockers,
      clients,
      scores,
      scoreHistory: data.scoreHistory.filter((entry) => entry.team_id === teamId),
    }),
  };
}

export async function getEmployeeProfileData(teamId: string, employeeId: string): Promise<EmployeeProfileData | null> {
  const data = await getGlobalData();
  const employee = data.employees.find((entry) => entry.id === employeeId && entry.team_id === teamId);
  const team = data.teams.find((entry) => entry.id === teamId);
  if (!employee || !team) return null;

  const updates = data.updates.filter((entry) => entry.employee_id === employeeId);
  const projects = getEmployeeProjects(employeeId, data.projects);
  const blockers = data.blockers.filter((entry) => entry.employee_id === employeeId);
  const score = data.scores.find((entry) => entry.employee_id === employeeId) ?? null;
  const scoreHistory = data.scoreHistory.filter((entry) => entry.employee_id === employeeId);
  const contributionPercent = Math.min(
    100,
    Math.round((updates.reduce((sum, entry) => sum + entry.progress_percentage, 0) / Math.max(data.updates.length * 10, 1)) * 100),
  );
  const missedUpdates = Math.max(0, 7 - updates.length);

  return {
    employee,
    team,
    projects,
    updates,
    score,
    scoreHistory,
    blockers,
    contributionPercent,
    missedUpdates,
    scoreSnapshot: buildScoreSnapshot(score, updates, projects),
  };
}

export async function getProjectDetailData(projectId: string): Promise<ProjectDetailData | null> {
  const data = await getGlobalData();
  const project = data.projects.find((entry) => entry.id === projectId);
  if (!project) return null;

  const team = data.teams.find((entry) => entry.id === project.team_id)!;
  const client = data.clients.find((entry) => entry.id === project.client_id);
  const updates = data.updates.filter((entry) => entry.project_id === projectId);
  const blockers = data.blockers.filter((entry) => entry.project_id === projectId);
  const employeeIds = demoData.projectEmployees.filter((entry) => entry.project_id === projectId).map((entry) => entry.employee_id);
  const employees = data.employees.filter((entry) => employeeIds.includes(entry.id));
  const milestoneRate = Math.round((project.current_milestone / project.total_milestones) * 100);
  const deadlineRisk =
    project.status === "blocked"
      ? "Critical attention needed"
      : isAfter(new Date("2026-04-30T09:00:00.000Z"), parseISO(project.deadline))
        ? "Overdue"
        : differenceInCalendarDays(parseISO(project.deadline), new Date("2026-04-30T09:00:00.000Z")) <= 7
          ? "Watch closely"
          : "Healthy runway";

  return {
    project,
    team,
    client,
    employees,
    updates,
    blockers,
    milestoneRate,
    deadlineRisk,
  };
}

export function buildDerivedScore(employee: Employee, updates: DailyUpdate[], projects: Project[], previous?: EmployeeScore) {
  return calculateEmployeeScore(employee, updates, projects, previous);
}
