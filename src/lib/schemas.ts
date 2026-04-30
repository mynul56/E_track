import { z } from "zod";

export const teamSchema = z.object({
  team_name: z.string().min(2, "Team name is required."),
  description: z.string().min(10, "Add a short team description."),
});

export const employeeSchema = z.object({
  full_name: z.string().min(2, "Employee name is required."),
  employee_code: z.string().min(2, "Employee code is required."),
  team_id: z.string().min(1, "Team is required."),
  role: z.enum(["admin", "team_leader", "viewer", "employee"]),
  status: z.enum(["active", "inactive"]),
});

export const updateParserSchema = z.object({
  team_id: z.string().min(1),
  employee_id: z.string().min(1),
  raw_text: z.string().min(20, "Paste the full Telegram update."),
});

export const manualScoreAdjustmentSchema = z.object({
  employee_id: z.string().min(1),
  team_id: z.string().min(1),
  score_change: z.number().min(-100).max(100),
  reason: z.string().min(5),
  adjustment_type: z.enum(["bonus", "penalty"]),
});

export type TeamFormValues = z.infer<typeof teamSchema>;
export type EmployeeFormValues = z.infer<typeof employeeSchema>;
export type UpdateParserFormValues = z.infer<typeof updateParserSchema>;
export type ManualScoreAdjustmentValues = z.infer<typeof manualScoreAdjustmentSchema>;
