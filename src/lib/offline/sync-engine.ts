"use client";

type SyncItemState = "queued" | "syncing" | "synced" | "failed";

export type SyncQueueItem<TPayload> = {
  id: string;
  payload: TPayload;
  state: SyncItemState;
  attempts: number;
  retryAt: number | null;
  lastError: string | null;
  createdAt: number;
  updatedAt: number;
};

type ProcessResult = { ok: true } | { ok: false; error: string; retryable?: boolean };

type SyncEngineOptions<TPayload> = {
  processItem: (item: SyncQueueItem<TPayload>) => Promise<ProcessResult>;
  onQueueChange?: (queue: Array<SyncQueueItem<TPayload>>) => void;
  tickIntervalMs?: number;
  maxBackoffMs?: number;
};

function backoffMs(attempt: number, cap: number) {
  const base = 1_000;
  return Math.min(base * 2 ** Math.max(0, attempt - 1), cap);
}

export class SyncEngine<TPayload> {
  private queue: Array<SyncQueueItem<TPayload>> = [];
  private running = false;
  private tickIntervalId: number | null = null;
  private readonly processItem;
  private readonly onQueueChange;
  private readonly tickIntervalMs;
  private readonly maxBackoffMs;

  constructor(options: SyncEngineOptions<TPayload>) {
    this.processItem = options.processItem;
    this.onQueueChange = options.onQueueChange;
    this.tickIntervalMs = options.tickIntervalMs ?? 10_000;
    this.maxBackoffMs = options.maxBackoffMs ?? 60_000;
  }

  start() {
    if (typeof window === "undefined") return;
    if (this.running) return;

    this.running = true;
    window.addEventListener("online", this.handleOnline);
    this.tickIntervalId = window.setInterval(this.handleTick, this.tickIntervalMs);
    void this.flush();
  }

  stop() {
    if (typeof window === "undefined") return;
    if (!this.running) return;

    this.running = false;
    window.removeEventListener("online", this.handleOnline);
    if (this.tickIntervalId !== null) {
      window.clearInterval(this.tickIntervalId);
      this.tickIntervalId = null;
    }
  }

  enqueue(payload: TPayload, id: string) {
    const now = Date.now();
    this.queue.push({
      id,
      payload,
      state: "queued",
      attempts: 0,
      retryAt: null,
      lastError: null,
      createdAt: now,
      updatedAt: now,
    });
    this.emit();
    void this.flush();
  }

  getQueue() {
    return [...this.queue];
  }

  private emit() {
    this.onQueueChange?.(this.getQueue());
  }

  private handleOnline = () => {
    void this.flush();
  };

  private handleTick = () => {
    void this.flush();
  };

  private mark(item: SyncQueueItem<TPayload>, next: Partial<SyncQueueItem<TPayload>>) {
    Object.assign(item, next, { updatedAt: Date.now() });
    this.emit();
  }

  async flush() {
    if (!this.running || typeof navigator === "undefined" || !navigator.onLine) {
      return;
    }

    for (const item of this.queue) {
      if (item.state === "synced") {
        continue;
      }

      if (item.retryAt !== null && item.retryAt > Date.now()) {
        break;
      }

      this.mark(item, { state: "syncing", lastError: null });

      const result = await this.processItem(item);
      if (result.ok) {
        this.mark(item, { state: "synced", retryAt: null, lastError: null });
        continue;
      }

      const attempts = item.attempts + 1;
      const retryable = result.retryable ?? true;
      this.mark(item, {
        state: "failed",
        attempts,
        retryAt: retryable ? Date.now() + backoffMs(attempts, this.maxBackoffMs) : null,
        lastError: result.error,
      });

      break;
    }

    this.queue = this.queue.filter((item) => item.state !== "synced");
    this.emit();
  }
}
