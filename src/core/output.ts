import path from "node:path";
import type { ArchiveFormat } from "../types.js";

const extensions: Record<ArchiveFormat, string> = {
  zip: ".zip",
  tar: ".tar",
  tgz: ".tar.gz",
  "7z": ".7z",
};

export function getExtension(format: ArchiveFormat): string {
  return extensions[format];
}

export function buildOutputFileName(
  inputDir: string,
  format: ArchiveFormat,
  explicitName?: string,
): string {
  if (explicitName) return explicitName;
  return `${path.basename(inputDir)}${getExtension(format)}`;
}
