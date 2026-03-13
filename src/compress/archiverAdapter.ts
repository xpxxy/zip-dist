import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import archiver from "archiver";
import type { CompressParams } from "../types.js";
import { getExtension } from "../core/output.js";
import { moveFileSafe } from "./fileOps.js";

type ArchiverFormat = "zip" | "tar";

export async function compressWithArchiver(params: CompressParams): Promise<number> {
  const { inputDir, outFile, level, format, onProgress, onWarning } = params;
  const kind: ArchiverFormat = format === "zip" ? "zip" : "tar";
  const totals = computeDirStats(inputDir);
  const tmpFile = path.join(
    os.tmpdir(),
    `zip-dist-${Date.now()}-${Math.random().toString(16).slice(2)}${getExtension(format)}`,
  );
  const output = fs.createWriteStream(tmpFile);
  let filesProcessed = 0;
  let processedBytes = 0;

  const archive = archiver(kind, {
    zlib: { level },
    gzip: format === "tgz",
    gzipOptions: { level },
  });

  archive.on("warning", (warn: { message?: string }) => onWarning(String(warn?.message ?? warn)));
  archive.on("entry", (entry: { type?: string }) => {
    if (entry?.type !== "directory") {
      filesProcessed += 1;
    }
  });
  archive.on(
    "progress",
    (progress: {
      fs: { totalBytes: number; processedBytes: number };
      entries: { total: number; processed: number };
    }) => {
      processedBytes = progress.fs.processedBytes || processedBytes;
      onProgress({
        filesProcessed,
        filesTotal: totals.filesTotal,
        processedBytes,
        totalBytes: totals.bytesTotal,
        percent:
          totals.bytesTotal > 0
            ? Math.min(99.9, (processedBytes / totals.bytesTotal) * 100)
            : totals.filesTotal > 0
              ? Math.min(99.9, (filesProcessed / totals.filesTotal) * 100)
              : undefined,
      });
    },
  );

  const done = new Promise<number>((resolve, reject) => {
    output.on("close", () => resolve(archive.pointer()));
    output.on("error", reject);
    archive.on("error", reject);
  });

  archive.pipe(output);
  archive.directory(inputDir, false);
  void archive.finalize();

  const bytes = await done;
  onProgress({
    filesProcessed: totals.filesTotal,
    filesTotal: totals.filesTotal,
    processedBytes: totals.bytesTotal > 0 ? totals.bytesTotal : bytes,
    totalBytes: totals.bytesTotal > 0 ? totals.bytesTotal : bytes,
    percent: 100,
  });
  moveFileSafe(tmpFile, outFile);
  return bytes;
}

function computeDirStats(rootDir: string): { filesTotal: number; bytesTotal: number } {
  let filesTotal = 0;
  let bytesTotal = 0;
  const stack = [rootDir];
  while (stack.length > 0) {
    const current = stack.pop();
    if (!current) break;
    const entries = fs.readdirSync(current, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(current, entry.name);
      try {
        if (entry.isDirectory()) {
          stack.push(fullPath);
          continue;
        }
        if (entry.isFile()) {
          filesTotal += 1;
          bytesTotal += fs.statSync(fullPath).size;
        }
      } catch {
        // Ignore temporary permission or IO errors while scanning totals.
      }
    }
  }
  return { filesTotal, bytesTotal };
}
