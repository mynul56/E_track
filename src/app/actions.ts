"use server";

import { revalidatePath } from "next/cache";
import { randomUUID } from "node:crypto";
import { parseTelegramUpdate } from "@/lib/parser";
import {
  employeeSchema,
  manualScoreAdjustmentSchema,
  teamSchema,
  updateParserSchema,
} from "@/lib/schemas";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function createTeamAction(input: unknown) {
  const values = teamSchema.parse(input);
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return { ok: true, mode: "demo", message: "Team validated. Connect Supabase to persist changes." };
  }

  const { error } = await supabase.from("teams").insert({
    id: randomUUID(),
    ...values,
    created_at: new Date().toISOString(),
  });

  if (error) return { ok: false, message: error.message };
  revalidatePath("/teams");
  return { ok: true, mode: "live", message: "Team created successfully." };
}

export async function createEmployeeAction(input: unknown) {
  const values = employeeSchema.parse(input);
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return { ok: true, mode: "demo", message: "Employee validated. Connect Supabase to persist changes." };
  }

  const { error } = await supabase.from("employees").insert({
    id: randomUUID(),
    ...values,
    created_at: new Date().toISOString(),
  });

  if (error) return { ok: false, message: error.message };
  revalidatePath(`/teams/${values.team_id}`);
  revalidatePath("/teams");
  return { ok: true, mode: "live", message: "Employee added successfully." };
}

export async function parseUpdateAction(input: unknown) {
  const values = updateParserSchema.parse(input);
  return {
    ok: true,
    parsed: parseTelegramUpdate(values.raw_text),
  };
}

export async function saveParsedUpdateAction(input: unknown) {
  const values = updateParserSchema.parse(input);
  const parsed = parseTelegramUpdate(values.raw_text);
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return {
      ok: true,
      mode: "demo",
      message: "Parsed successfully. Connect Supabase to persist this update.",
      parsed,
    };
  }

  const { error } = await supabase.from("daily_updates").insert({
    id: randomUUID(),
    employee_id: values.employee_id,
    team_id: values.team_id,
    project_id: null,
    client_id: null,
    date: new Date().toISOString(),
    raw_text: values.raw_text,
    parsed_json: parsed,
    progress_percentage: parsed.progress ?? 0,
    priority: parsed.priority ?? "medium",
    risk_level: parsed.riskLevel ?? "medium",
    blockers: parsed.blockers ?? [],
    next_actions: parsed.nextActions ?? [],
    client_status: parsed.clientStatus ?? "unknown",
    notes: "",
    quality_rating: 5,
    created_at: new Date().toISOString(),
  });

  if (error) return { ok: false, message: error.message };
  revalidatePath(`/teams/${values.team_id}/dashboard`);
  return { ok: true, mode: "live", message: "Daily update saved successfully.", parsed };
}

export async function adjustEmployeeScoreAction(input: unknown) {
  const values = manualScoreAdjustmentSchema.parse(input);
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return { ok: true, mode: "demo", message: "Score adjustment validated. Connect Supabase to save it." };
  }

  const { data: existing } = await supabase
    .from("employee_scores")
    .select("*")
    .eq("employee_id", values.employee_id)
    .maybeSingle();

  const before = existing?.total_score ?? 0;
  const after = before + values.score_change;

  const { error: scoreError } = await supabase.from("employee_scores").upsert({
    id: existing?.id ?? randomUUID(),
    employee_id: values.employee_id,
    team_id: values.team_id,
    total_score: after,
    progress_score: existing?.progress_score ?? 0,
    update_consistency_score: existing?.update_consistency_score ?? 0,
    blocker_resolution_score: existing?.blocker_resolution_score ?? 0,
    deadline_score: existing?.deadline_score ?? 0,
    quality_score: existing?.quality_score ?? 0,
    collaboration_score: existing?.collaboration_score ?? 0,
    last_calculated_at: new Date().toISOString(),
    created_at: existing?.created_at ?? new Date().toISOString(),
    updated_at: new Date().toISOString(),
    trend: values.score_change > 0 ? "up" : "down",
  });

  if (scoreError) return { ok: false, message: scoreError.message };

  const { error: historyError } = await supabase.from("score_history").insert({
    id: randomUUID(),
    employee_id: values.employee_id,
    team_id: values.team_id,
    score_before: before,
    score_after: after,
    score_change: values.score_change,
    reason: values.reason,
    source_type: "manual_adjustment",
    source_id: randomUUID(),
    created_at: new Date().toISOString(),
  });

  if (historyError) return { ok: false, message: historyError.message };
  revalidatePath("/leaderboard");
  revalidatePath(`/teams/${values.team_id}/leaderboard`);
  return { ok: true, mode: "live", message: "Score adjustment applied." };
}
