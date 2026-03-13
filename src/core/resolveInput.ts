import fs from "node:fs";
import path from "node:path";
import { CliError } from "../errors.js";

export function resolveInputDir(
  inputArg: string | undefined,
  cwd: string,
): { inputDir: string; usedDefaultDist: boolean } {
  if (inputArg) {
    return {
      inputDir: path.isAbsolute(inputArg) ? inputArg : path.resolve(cwd, inputArg),
      usedDefaultDist: false,
    };
  }
  return { inputDir: path.resolve(cwd, "dist"), usedDefaultDist: true };
}

export function validateInputDir(inputDir: string, usedDefaultDist: boolean): void {
  if (!fs.existsSync(inputDir)) {
    if (usedDefaultDist) {
      throw new CliError("defaultDistMissing", { value: inputDir });
    }
    throw new CliError("inputNotExist", { value: inputDir });
  }
  if (!fs.statSync(inputDir).isDirectory()) {
    throw new CliError("inputMustDirectory", { value: inputDir });
  }
}
