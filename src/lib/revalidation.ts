import { revalidatePath } from "next/cache";

const HISTORY_PATH = "/history";
const ROUTINES_PATH = "/routines";
const TODAY_PATH = "/today";
const SESSION_PATH_PREFIX = "/session";

export function revalidateSessionViews(sessionId: string) {
  revalidatePath(`${SESSION_PATH_PREFIX}/${sessionId}`);
}

export function revalidateHistoryViews() {
  revalidatePath(HISTORY_PATH);
}

export function revalidateRoutinesViews() {
  revalidatePath(ROUTINES_PATH);
  revalidatePath(TODAY_PATH);
}
