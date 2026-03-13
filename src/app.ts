import path from "node:path";
import { parseArgs } from "./cli/parseArgs.js";
import { compress } from "./compress/index.js";
import { buildOutputFileName } from "./core/output.js";
import { resolveInputDir, validateInputDir } from "./core/resolveInput.js";
import { CliError } from "./errors.js";
import { createI18n, detectLang } from "./i18n/index.js";
import { ProgressReporter } from "./ui/progress.js";
import { formatBytes } from "./utils/size.js";

export async function run(argv: string[], env: NodeJS.ProcessEnv = process.env): Promise<number> {
  let options;
  try {
    options = parseArgs(argv, process.cwd());
  } catch (err) {
    return printError(err, detectLang(env));
  }

  const lang = options.lang ?? detectLang(env);
  const i18n = createI18n(lang);

  if (options.help) {
    console.log(`${i18n.t("usage")}\n${i18n.t("options")}`);
    return 0;
  }

  try {
    const { inputDir, usedDefaultDist } = resolveInputDir(options.inputArg, process.cwd());
    validateInputDir(inputDir, usedDefaultDist);

    const outName = buildOutputFileName(inputDir, options.format, options.name);
    const outFile = path.join(options.outputDir, outName);

    const reporter = new ProgressReporter(i18n.t("compressing"), i18n.t("files"));
    const bytes = await compress({
      inputDir,
      outFile,
      level: options.level,
      format: options.format,
      onProgress: (state) => reporter.update(state),
      onWarning: (msg) => console.warn(i18n.t("warning", { value: msg })),
    });
    reporter.stop();

    console.log(i18n.t("done", { value: outFile }));
    console.log(i18n.t("size", { value: formatBytes(bytes) }));
    return 0;
  } catch (err) {
    return printError(err, lang);
  }
}

function printError(err: unknown, lang: "zh-CN" | "en"): number {
  const i18n = createI18n(lang);
  if (err instanceof CliError) {
    const message = i18n.t(err.key as never, err.vars);
    console.error(i18n.t("failed", { value: message }));
    return err.exitCode;
  }
  const message = err instanceof Error ? err.message : String(err);
  console.error(i18n.t("failed", { value: message }));
  return 1;
}
