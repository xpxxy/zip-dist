import readline from "node:readline";
import type { ProgressState } from "../types.js";
import { formatBytes } from "../utils/size.js";

export class ProgressReporter {
  private readonly enabled: boolean;
  private readonly label: string;
  private readonly filesText: string;
  private stopped = false;
  private lastRenderedAt = 0;

  constructor(label: string, filesText: string) {
    this.enabled = Boolean(process.stdout.isTTY);
    this.label = label;
    this.filesText = filesText;
  }

  update(state: ProgressState): void {
    if (!this.enabled || this.stopped) return;
    const now = Date.now();
    if (now - this.lastRenderedAt < 120) return;
    this.lastRenderedAt = now;

    const percent = state.percent ?? this.computePercent(state);
    const boundedPercent = Math.max(0, Math.min(100, percent));
    const barWidth = 24;
    const filled = Math.round((boundedPercent / 100) * barWidth);
    const bar = `${"#".repeat(filled)}${"-".repeat(Math.max(0, barWidth - filled))}`;
    const filePart =
      typeof state.filesProcessed === "number"
        ? typeof state.filesTotal === "number"
          ? `${state.filesProcessed}/${state.filesTotal} ${this.filesText}`
          : `${state.filesProcessed} ${this.filesText}`
        : "";
    const sizePart =
      typeof state.processedBytes === "number"
        ? typeof state.totalBytes === "number" && state.totalBytes > 0
          ? `${formatBytes(state.processedBytes)} / ${formatBytes(state.totalBytes)}`
          : formatBytes(state.processedBytes)
        : "";

    const line =
      `${this.label} ${boundedPercent.toFixed(1)}% [${bar}] ${filePart} ${sizePart}`.trim();
    readline.clearLine(process.stdout, 0);
    readline.cursorTo(process.stdout, 0);
    process.stdout.write(line);
  }

  stop(): void {
    if (!this.enabled || this.stopped) return;
    this.stopped = true;
    readline.clearLine(process.stdout, 0);
    readline.cursorTo(process.stdout, 0);
  }

  private computePercent(state: ProgressState): number {
    if (
      typeof state.processedBytes === "number" &&
      typeof state.totalBytes === "number" &&
      state.totalBytes > 0
    ) {
      return (state.processedBytes / state.totalBytes) * 100;
    }
    if (
      typeof state.filesProcessed === "number" &&
      typeof state.filesTotal === "number" &&
      state.filesTotal > 0
    ) {
      return (state.filesProcessed / state.filesTotal) * 100;
    }
    return 0;
  }
}
