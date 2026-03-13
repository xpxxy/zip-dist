import path from "node:path";
import { CliError } from "../errors.js";
import { normalizeLang } from "../i18n/index.js";
import type { ArchiveFormat, CliOptions } from "../types.js";

const formats = new Set<ArchiveFormat>(["zip", "tar", "tgz", "7z"]);

export function parseArgs(argv: string[], cwd: string): CliOptions {
  const options: CliOptions = {
    outputDir: cwd,
    level: 9,
    format: "zip",
    help: false,
  };

  let i = 0;
  while (i < argv.length) {
    const arg = argv[i];
    if (arg === "-h" || arg === "--help") {
      options.help = true;
      i += 1;
      continue;
    }
    if (arg === "-o" || arg === "--output") {
      const value = requireValue(argv, i + 1, arg);
      options.outputDir = resolvePath(value, cwd);
      i += 2;
      continue;
    }
    if (arg === "-n" || arg === "--name") {
      options.name = requireValue(argv, i + 1, arg);
      i += 2;
      continue;
    }
    if (arg === "-l" || arg === "--level") {
      const value = requireValue(argv, i + 1, arg);
      const level = Number(value);
      if (!Number.isFinite(level)) {
        throw new CliError("invalidNumber", { value });
      }
      options.level = level;
      i += 2;
      continue;
    }
    if (arg === "-f" || arg === "--format") {
      const value = requireValue(argv, i + 1, arg) as ArchiveFormat;
      if (!formats.has(value)) {
        throw new CliError("invalidFormat", { value });
      }
      options.format = value;
      i += 2;
      continue;
    }
    if (arg === "--lang") {
      const value = requireValue(argv, i + 1, arg);
      const lang = normalizeLang(value);
      if (!lang) {
        throw new CliError("invalidLang", { value });
      }
      options.lang = lang;
      i += 2;
      continue;
    }
    if (arg.startsWith("-")) {
      throw new CliError("unknownOption", { value: arg });
    }

    if (!options.inputArg) {
      options.inputArg = arg;
      i += 1;
      continue;
    }

    throw new CliError("unknownOption", { value: arg });
  }

  if (options.level < 1 || options.level > 9) {
    throw new CliError("invalidLevelRange");
  }

  return options;
}

function requireValue(argv: string[], index: number, flag: string): string {
  const value = argv[index];
  if (!value || value.startsWith("-")) {
    throw new CliError("outputDirMissingValue", { flag });
  }
  return value;
}

function resolvePath(target: string, cwd: string): string {
  return path.isAbsolute(target) ? target : path.resolve(cwd, target);
}
