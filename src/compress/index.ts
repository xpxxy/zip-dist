import type { CompressParams } from "../types.js";
import { compressWithArchiver } from "./archiverAdapter.js";
import { compressWith7z } from "./sevenZipAdapter.js";

export async function compress(params: CompressParams): Promise<number> {
  if (params.format === "7z") {
    return compressWith7z(params);
  }
  return compressWithArchiver(params);
}
