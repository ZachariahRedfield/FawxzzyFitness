"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import type { ActionResult } from "@/lib/action-result";
import { supabaseServer } from "@/lib/supabase/server";

export async function updateLogMetaAction(payload: { logId: string; dayNameOverride: string; notes: string }): Promise<ActionResult> {
  const user = await requireUser();
  const supabase = supabaseServer();

  const logId = payload.logId.trim();
  const dayNameOverride = payload.dayNameOverride.trim();
  const notes = payload.notes.trim();

  if (!logId) {
    return { ok: false, error: "Missing log id." };
  }

  const { error } = await supabase
    .from("sessions")
    .update({
      day_name_override: dayNameOverride || null,
      notes: notes || null,
    })
    .eq("id", logId)
    .eq("user_id", user.id)
    .eq("status", "completed");

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/history");
  revalidatePath(`/history/${logId}`);
  revalidatePath("/today");
  return { ok: true };
}

export async function updateLogExerciseAction(payload: { logId: string; logExerciseId: string; exerciseId: string; notes: string }): Promise<ActionResult> {
  const user = await requireUser();
  const supabase = supabaseServer();

  const logId = payload.logId.trim();
  const logExerciseId = payload.logExerciseId.trim();
  const exerciseId = payload.exerciseId.trim();
  const notes = payload.notes.trim();

  if (!logId || !logExerciseId || !exerciseId) {
    return { ok: false, error: "Missing log exercise details." };
  }

  const { error } = await supabase
    .from("session_exercises")
    .update({ notes: notes || null, exercise_id: exerciseId })
    .eq("id", logExerciseId)
    .eq("session_id", logId)
    .eq("user_id", user.id);

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/history");
  revalidatePath(`/history/${logId}`);
  return { ok: true };
}

export async function addLogExerciseAction(payload: { logId: string; exerciseId: string }): Promise<ActionResult> {
  const user = await requireUser();
  const supabase = supabaseServer();

  const logId = payload.logId.trim();
  const exerciseId = payload.exerciseId.trim();

  if (!logId || !exerciseId) {
    return { ok: false, error: "Missing exercise details." };
  }

  const { data: maxPositionRow, error: maxPositionError } = await supabase
    .from("session_exercises")
    .select("position")
    .eq("session_id", logId)
    .eq("user_id", user.id)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (maxPositionError) {
    return { ok: false, error: maxPositionError.message };
  }

  const nextPosition = maxPositionRow ? maxPositionRow.position + 1 : 0;

  const { error } = await supabase
    .from("session_exercises")
    .insert({
      session_id: logId,
      user_id: user.id,
      exercise_id: exerciseId,
      position: nextPosition,
      is_skipped: false,
      notes: null,
    });

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/history");
  revalidatePath(`/history/${logId}`);
  return { ok: true };
}

export async function deleteLogExerciseAction(payload: { logId: string; logExerciseId: string }): Promise<ActionResult> {
  const user = await requireUser();
  const supabase = supabaseServer();

  const logId = payload.logId.trim();
  const logExerciseId = payload.logExerciseId.trim();

  if (!logId || !logExerciseId) {
    return { ok: false, error: "Missing exercise details." };
  }

  const { error } = await supabase
    .from("session_exercises")
    .delete()
    .eq("id", logExerciseId)
    .eq("session_id", logId)
    .eq("user_id", user.id);

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/history");
  revalidatePath(`/history/${logId}`);
  return { ok: true };
}
