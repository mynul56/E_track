import type { ParsedUpdate, Priority, RiskLevel } from "@/lib/types";

const priorityMap: Record<string, Priority> = {
  low: "low",
  medium: "medium",
  high: "high",
  critical: "critical",
};

const riskMap: Record<string, RiskLevel> = {
  low: "low",
  medium: "medium",
  high: "high",
  critical: "critical",
};

function valueFor(label: string, raw: string) {
  const pattern = new RegExp(`^${label}\\s*:\\s*(.+)$`, "im");
  return raw.match(pattern)?.[1]?.trim();
}

function listFrom(value?: string) {
  if (!value) return [];
  return value
    .split(/,|\n|;|\u2022|-/)
    .map((part) => part.trim())
    .filter(Boolean);
}

export function parseTelegramUpdate(rawText: string, selectedEmployeeCode?: string): ParsedUpdate {
  const employeeId = valueFor("E_ID", rawText) ?? valueFor("Employee ID", rawText);
  const parsed: ParsedUpdate = {
    employee: valueFor("Employee", rawText),
    employeeId,
    clientName: valueFor("Client", rawText),
    projectName: valueFor("Project", rawText),
    orderId: valueFor("Order ID", rawText),
    milestone: valueFor("Milestone", rawText),
    progress: Number((valueFor("Progress", rawText) ?? "").replace("%", "")) || undefined,
    deadline: valueFor("Deadline", rawText),
    blockers: listFrom(valueFor("Blockers", rawText)),
    nextActions: listFrom(valueFor("Next Actions", rawText)),
    priority: priorityMap[(valueFor("Priority", rawText) ?? "").toLowerCase()],
    riskLevel: riskMap[(valueFor("Risk", rawText) ?? valueFor("Risk Level", rawText) ?? "").toLowerCase()],
    clientStatus: valueFor("Client Status", rawText),
    attachments: listFrom(valueFor("Attachments", rawText)),
    warnings: [],
  };

  if (!parsed.employee) parsed.warnings?.push("Employee name could not be detected.");
  if (!parsed.projectName) parsed.warnings?.push("Project name is missing.");
  if (!parsed.clientName) parsed.warnings?.push("Client name is missing.");
  if (selectedEmployeeCode && employeeId && selectedEmployeeCode !== employeeId) {
    parsed.warnings?.push(`Selected employee code ${selectedEmployeeCode} does not match pasted code ${employeeId}.`);
  }
  if (!parsed.progress && parsed.progress !== 0) {
    parsed.warnings?.push("Progress percentage could not be parsed.");
  }

  return parsed;
}
