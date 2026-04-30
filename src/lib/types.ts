export type Role = "admin" | "team_leader" | "viewer" | "employee";
export type Status = "active" | "inactive" | "on_track" | "blocked" | "delayed" | "completed";
export type Priority = "low" | "medium" | "high" | "critical";
export type RiskLevel = "low" | "medium" | "high" | "critical";
export type ProjectType = "milestone" | "full";
export type BlockerSeverity = "low" | "medium" | "high" | "critical";
export type Trend = "up" | "down" | "same";

export interface Team {
  id: string;
  team_name: string;
  description: string;
  created_at: string;
}

export interface Employee {
  id: string;
  full_name: string;
  employee_code: string;
  team_id: string;
  role: Role;
  status: "active" | "inactive";
  created_at: string;
}

export interface Client {
  id: string;
  client_name: string;
  company_name: string;
  contact_info: string;
  created_at: string;
}

export interface Project {
  id: string;
  project_name: string;
  client_id: string;
  order_id: string;
  team_id: string;
  project_type: ProjectType;
  total_milestones: number;
  current_milestone: number;
  deadline: string;
  priority: Priority;
  risk_level: RiskLevel;
  status: "on_track" | "blocked" | "delayed" | "completed";
  progress: number;
  created_at: string;
}

export interface ProjectEmployee {
  id: string;
  project_id: string;
  employee_id: string;
}

export interface DailyUpdate {
  id: string;
  employee_id: string;
  team_id: string;
  project_id: string;
  client_id: string;
  date: string;
  raw_text: string;
  parsed_json: ParsedUpdate;
  progress_percentage: number;
  priority: Priority;
  risk_level: RiskLevel;
  blockers: string[];
  next_actions: string[];
  client_status: string;
  notes: string;
  quality_rating: number;
  created_at: string;
}

export interface Blocker {
  id: string;
  project_id: string;
  employee_id: string;
  team_id: string;
  description: string;
  status: "open" | "resolved";
  severity: BlockerSeverity;
  created_at: string;
  resolved_at: string | null;
}

export interface Attachment {
  id: string;
  daily_update_id: string;
  file_name: string;
  file_url: string;
  file_type: string;
  created_at: string;
}

export interface EmployeeScore {
  id: string;
  employee_id: string;
  team_id: string;
  total_score: number;
  progress_score: number;
  update_consistency_score: number;
  blocker_resolution_score: number;
  deadline_score: number;
  quality_score: number;
  collaboration_score: number;
  last_calculated_at: string;
  created_at: string;
  updated_at: string;
  trend: Trend;
}

export interface ScoreHistory {
  id: string;
  employee_id: string;
  team_id: string;
  score_before: number;
  score_after: number;
  score_change: number;
  reason: string;
  source_type: "daily_update" | "manual_adjustment" | "system_rule";
  source_id: string;
  created_at: string;
}

export interface ParsedUpdate {
  employee?: string;
  employeeId?: string;
  clientName?: string;
  projectName?: string;
  orderId?: string;
  milestone?: string;
  progress?: number;
  deadline?: string;
  blockers?: string[];
  nextActions?: string[];
  priority?: Priority;
  riskLevel?: RiskLevel;
  clientStatus?: string;
  attachments?: string[];
  warnings?: string[];
}

export interface DashboardMetric {
  label: string;
  value: number | string;
  hint: string;
  delta?: string;
}

export interface ScoreSnapshot {
  strengths: string[];
  weakAreas: string[];
  missedUpdatePenalty: number;
  blockerPenalty: number;
  deadlinePenalty: number;
}

export interface TeamDashboardData {
  team: Team;
  employees: Employee[];
  projects: Project[];
  dailyUpdates: DailyUpdate[];
  blockers: Blocker[];
  clients: Client[];
  scores: EmployeeScore[];
  metrics: DashboardMetric[];
  missingUpdates: Employee[];
  topPerformer: EmployeeScore | null;
  lowestPerformer: EmployeeScore | null;
  averageScore: number;
  scoreChangeVsLastWeek: number;
  charts: Record<string, Array<Record<string, string | number>>>;
  alerts: string[];
}

export interface EmployeeProfileData {
  employee: Employee;
  team: Team;
  projects: Project[];
  updates: DailyUpdate[];
  score: EmployeeScore | null;
  scoreHistory: ScoreHistory[];
  blockers: Blocker[];
  contributionPercent: number;
  missedUpdates: number;
  scoreSnapshot: ScoreSnapshot;
}

export interface ProjectDetailData {
  project: Project;
  team: Team;
  client: Client | undefined;
  employees: Employee[];
  updates: DailyUpdate[];
  blockers: Blocker[];
  milestoneRate: number;
  deadlineRisk: string;
}

export interface GlobalDashboardData {
  teams: Team[];
  employees: Employee[];
  projects: Project[];
  updates: DailyUpdate[];
  blockers: Blocker[];
  clients: Client[];
  scores: EmployeeScore[];
  scoreHistory: ScoreHistory[];
}
