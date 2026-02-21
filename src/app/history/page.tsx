import Link from "next/link";
import { AppNav } from "@/components/AppNav";
import { requireUser } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabase/server";
import type { SessionRow } from "@/types/db";

export const dynamic = "force-dynamic";

export default async function HistoryPage() {
  const user = await requireUser();
  const supabase = supabaseServer();

  const { data } = await supabase
    .from("sessions")
    .select("id, user_id, performed_at, notes, routine_id, routine_day_index, name, routine_day_name, duration_seconds, status")
    .eq("user_id", user.id)
    .eq("status", "completed")
    .order("performed_at", { ascending: false })
    .limit(100);

  const sessions = (data ?? []) as SessionRow[];

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">History</h1>
      <div className="rounded-xl border border-border bg-surface/95 p-2">
        <ul className="max-h-[62vh] snap-y snap-mandatory space-y-2 overflow-y-auto overscroll-contain p-1 [scrollbar-gutter:stable]">
          {sessions.map((session, index) => (
            <li key={session.id} className="snap-start">
              <Link href={`/session/${session.id}`} className="block rounded-lg border border-border bg-[rgb(var(--surface-2)/0.45)] p-3 transition-colors hover:bg-[rgb(var(--surface-2)/0.65)]">
                <p className="text-[11px] font-medium uppercase tracking-wide text-faint">Log #{index + 1}</p>
                <p className="font-semibold text-text">{session.name || "Session"}</p>
                <p className="text-sm text-muted">{session.routine_day_name || (session.routine_day_index ? `Day ${session.routine_day_index}` : "Day X")}</p>
                <p className="text-xs text-faint">{new Date(session.performed_at).toLocaleString()}</p>
              </Link>
            </li>
          ))}
          {sessions.length === 0 ? <li className="rounded-lg border border-border bg-bg/40 p-3 text-sm text-muted">No sessions yet.</li> : null}
        </ul>
      </div>
      <AppNav />
    </section>
  );
}
