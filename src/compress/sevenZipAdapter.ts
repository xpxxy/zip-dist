import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import { path7za } from "7zip-bin";
import type { CompressParams } from "../types.js";
import { moveFileSafe } from "./fileOps.js";

export async function compressWith7z(params: CompressParams): Promise<number> {
  const { inputDir, outFile, level, onProgress } = params;
  const tmpFile = path.join(
    os.tmpdir(),
    `zip-dist-${Date.now()}-${Math.random().toString(16).slice(2)}.7z`,
  );

  await new Promise<void>((resolve, reject) => {
    const child = spawn(path7za, ["a", "-bsp1", "-t7z", tmpFile, ".", `-mx=${level}`], {
      cwd: inputDir,
      stdio: ["ignore", "pipe", "pipe"],
    });
    let lastPercent = 0;
    let pending = "";

    const consume = (chunk: Buffer): void => {
      pending += chunk.toString("utf8");
      const matches = pending.matchAll(/(\d{1,3})%/g);
      for (const match of matches) {
        const value = Number(match[1]);
        if (Number.isFinite(value) && value >= lastPercent && value <= 100) {
          lastPercent = value;
          onProgress({ percent: value });
        }
      }
      pending = pending.slice(-16);
    };

    child.stdout.on("data", consume);
    child.stderr.on("data", consume);
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) {
        onProgress({ percent: 100 });
        resolve();
      } else reject(new Error(`7z exited with code ${code ?? "unknown"}`));
    });
  });

  moveFileSafe(tmpFile, outFile);
  return fs.statSync(outFile).size;
}
