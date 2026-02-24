"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/ToastProvider";
import { Glass } from "@/components/ui/Glass";
import { tapFeedbackClass } from "@/components/ui/interactionClasses";
import { toastActionResult } from "@/lib/action-feedback";
import { addLogExerciseAction, deleteLogExerciseAction, updateLogExerciseAction, updateLogMetaAction } from "@/app/actions/history";

type AuditSet = {
  id: string;
  set_index: number;
  weight: number;
  reps: number;
  duration_seconds: number | null;
};

type AuditExercise = {
  id: string;
  exercise_id: string;
  notes: string | null;
  sets: AuditSet[];
};

type EditableExercise = {
  id: string;
  exerciseId: string;
  notes: string;
  isNew?: boolean;
};

export function LogAuditClient({
  logId,
  initialDayName,
  initialNotes,
  unitLabel,
  exerciseNameMap,
  exerciseOptions,
  exercises,
}: {
  logId: string;
  initialDayName: string;
  initialNotes: string | null;
  unitLabel: "lbs" | "kg";
  exerciseNameMap: Record<string, string>;
  exerciseOptions: Array<{ id: string; name: string }>;
  exercises: AuditExercise[];
}) {
  const router = useRouter();
  const toast = useToast();
  const [isPending, startTransition] = useTransition();
  const [isEditing, setIsEditing] = useState(false);
  const [dayName, setDayName] = useState(initialDayName);
  const [sessionNotes, setSessionNotes] = useState(initialNotes ?? "");
  const [editableExercises, setEditableExercises] = useState<EditableExercise[]>(
    exercises.map((exercise) => ({ id: exercise.id, exerciseId: exercise.exercise_id, notes: exercise.notes ?? "" })),
  );

  const originalById = useMemo(() => new Map(exercises.map((exercise) => [exercise.id, exercise])), [exercises]);

  const handleCancel = () => {
    setIsEditing(false);
    setDayName(initialDayName);
    setSessionNotes(initialNotes ?? "");
    setEditableExercises(exercises.map((exercise) => ({ id: exercise.id, exerciseId: exercise.exercise_id, notes: exercise.notes ?? "" })));
  };

  const handleSave = () => {
    startTransition(async () => {
      const metaResult = await updateLogMetaAction({
        logId,
        dayNameOverride: dayName,
        notes: sessionNotes,
      });

      if (!metaResult.ok) {
        toastActionResult(toast, metaResult, { success: "", error: "Unable to save log details." });
        return;
      }

      for (const original of exercises) {
        if (!editableExercises.find((exercise) => exercise.id === original.id)) {
          const deleteResult = await deleteLogExerciseAction({ logId, logExerciseId: original.id });
          if (!deleteResult.ok) {
            toastActionResult(toast, deleteResult, { success: "", error: "Unable to remove exercise." });
            return;
          }
        }
      }

      for (const exercise of editableExercises) {
        if (exercise.isNew) {
          const addResult = await addLogExerciseAction({ logId, exerciseId: exercise.exerciseId });
          if (!addResult.ok) {
            toastActionResult(toast, addResult, { success: "", error: "Unable to add exercise." });
            return;
          }
          continue;
        }

        const result = await updateLogExerciseAction({
          logId,
          logExerciseId: exercise.id,
          exerciseId: exercise.exerciseId,
          notes: exercise.notes,
        });

        if (!result.ok) {
          toastActionResult(toast, result, { success: "", error: "Unable to save exercise details." });
          return;
        }
      }

      setIsEditing(false);
      toastActionResult(toast, { ok: true }, { success: "Log details saved.", error: "Unable to save log details." });
      router.refresh();
    });
  };

  return (
    <>
      <Glass variant="base" className="p-4" interactive={false}>
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Session Summary</h2>
          {isEditing ? (
            <div className="flex items-center gap-2">
              <button type="button" onClick={handleCancel} disabled={isPending} className={`rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium ${tapFeedbackClass}`}>
                Cancel
              </button>
              <button type="button" onClick={handleSave} disabled={isPending} className={`rounded-md bg-accent px-3 py-1.5 text-xs font-semibold text-white ${tapFeedbackClass}`}>
                {isPending ? "Saving..." : "Save"}
              </button>
            </div>
          ) : (
            <button type="button" onClick={() => setIsEditing(true)} className={`rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium ${tapFeedbackClass}`}>
              Edit
            </button>
          )}
        </div>

        {isEditing ? (
          <div className="space-y-3">
            <label className="block text-sm font-medium text-slate-600">
              Day Name
              <input value={dayName} onChange={(event) => setDayName(event.target.value)} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
            </label>
            <label className="block text-sm font-medium text-slate-600">
              Session Notes
              <textarea value={sessionNotes} onChange={(event) => setSessionNotes(event.target.value)} rows={3} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
            </label>
          </div>
        ) : (
          <dl className="space-y-2 text-sm text-slate-700">
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-500">Day Name</dt>
              <dd>{dayName || "—"}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-500">Session Notes</dt>
              <dd>{sessionNotes || "—"}</dd>
            </div>
          </dl>
        )}
      </Glass>

      <div className="space-y-3">
        {editableExercises.map((exercise) => {
          const original = originalById.get(exercise.id);
          const name = exerciseNameMap[exercise.exerciseId] ?? exercise.exerciseId;
          const setCount = original?.sets.length ?? 0;

          return (
            <Glass key={exercise.id} variant="base" className="p-4" interactive={false}>
              <div className="mb-2 flex items-center justify-between gap-2">
                {isEditing ? (
                  <select
                    value={exercise.exerciseId}
                    onChange={(event) => {
                      const nextExerciseId = event.target.value;
                      setEditableExercises((current) => current.map((entry) => (entry.id === exercise.id ? { ...entry, exerciseId: nextExerciseId } : entry)));
                    }}
                    className="w-full rounded-md border border-slate-300 px-2 py-1 text-sm"
                  >
                    {exerciseOptions.map((option) => (
                      <option key={option.id} value={option.id}>{option.name}</option>
                    ))}
                  </select>
                ) : (
                  <h3 className="text-base font-semibold text-slate-900">{name}</h3>
                )}
                <span className="rounded-md border border-slate-300 px-2 py-1 text-xs text-slate-600">{setCount} sets</span>
              </div>

              {original ? (
                <ul className="mb-3 space-y-1 text-sm text-slate-700">
                  {original.sets.map((set) => (
                    <li key={set.id} className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1">
                      Set {set.set_index + 1}: {set.weight}
                      {unitLabel} × {set.reps} reps
                      {set.duration_seconds !== null ? ` · ${set.duration_seconds} sec` : ""}
                    </li>
                  ))}
                </ul>
              ) : null}

              {isEditing ? (
                <>
                  {!exercise.isNew ? (
                    <label className="block text-sm font-medium text-slate-600">
                      Exercise Notes
                      <textarea
                        value={exercise.notes}
                        onChange={(event) => {
                          const nextValue = event.target.value;
                          setEditableExercises((current) => current.map((entry) => (entry.id === exercise.id ? { ...entry, notes: nextValue } : entry)));
                        }}
                        rows={2}
                        className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                      />
                    </label>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => setEditableExercises((current) => current.filter((entry) => entry.id !== exercise.id))}
                    className="mt-2 rounded-md border border-red-300 px-2 py-1 text-xs text-red-700"
                  >
                    Remove
                  </button>
                </>
              ) : (
                <p className="text-sm text-slate-600">Notes: {exercise.notes || "—"}</p>
              )}
            </Glass>
          );
        })}
      </div>

      {isEditing ? (
        <button
          type="button"
          onClick={() => {
            const fallback = exerciseOptions[0]?.id;
            if (!fallback) return;
            setEditableExercises((current) => ([
              ...current,
              { id: `new-${Date.now()}-${Math.random()}`, exerciseId: fallback, notes: "", isNew: true },
            ]));
          }}
          className={`w-full rounded-md border border-slate-300 px-3 py-2 text-sm font-medium ${tapFeedbackClass}`}
        >
          Add Exercise
        </button>
      ) : null}
    </>
  );
}
