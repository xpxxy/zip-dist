//#region \0rolldown/runtime.js
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
	if (from && typeof from === "object" || typeof from === "function") for (var keys = __getOwnPropNames(from), i = 0, n = keys.length, key; i < n; i++) {
		key = keys[i];
		if (!__hasOwnProp.call(to, key) && key !== except) __defProp(to, key, {
			get: ((k) => from[k]).bind(null, key),
			enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
		});
	}
	return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", {
	value: mod,
	enumerable: true
}) : target, mod));
//#endregion
let node_path = require("node:path");
node_path = __toESM(node_path);
let node_fs = require("node:fs");
node_fs = __toESM(node_fs);
let node_os = require("node:os");
node_os = __toESM(node_os);
let archiver = require("archiver");
archiver = __toESM(archiver);
let node_child_process = require("node:child_process");
let _7zip_bin = require("7zip-bin");
let node_readline = require("node:readline");
node_readline = __toESM(node_readline);
//#region src/errors.ts
var CliError = class extends Error {
	constructor(key, vars = {}, exitCode = 1) {
		super(key);
		this.key = key;
		this.vars = vars;
		this.exitCode = exitCode;
		this.name = "CliError";
	}
};
//#endregion
//#region src/i18n/locales/en.ts
const en = {
	usage: "Usage:\n  zip-dist [input]\n",
	options: [
		"Options:",
		"  -o, --output <dir>      Output directory (default: current directory)",
		"  -n, --name <name>       Output archive name (default: <inputFolder>.<ext>)",
		"  -f, --format <format>   Archive format: zip | tar | tgz | 7z (default: zip)",
		"  -l, --level <1-9>       Compression level (default: 9)",
		"      --lang <lang>       Language: zh-CN | en (default: auto)",
		"  -h, --help              Show help"
	].join("\n"),
	outputDirMissingValue: "{flag} requires a value",
	invalidNumber: "Compression level must be a number: {value}",
	invalidLevelRange: "Compression level must be in the range 1-9",
	invalidFormat: "Unsupported format: {value}. Use zip | tar | tgz | 7z",
	invalidLang: "Unsupported language: {value}. Use zh-CN | en",
	unknownOption: "Unknown option: {value}",
	inputNotExist: "Input directory does not exist: {value}",
	inputMustDirectory: "Input path must be a directory: {value}",
	defaultDistMissing: "No input provided and dist folder was not found: {value}",
	compressing: "Compressing",
	done: "Archive created: {value}",
	size: "Size: {value}",
	warning: "Warning: {value}",
	failed: "Failed: {value}",
	files: "files"
};
//#endregion
//#region src/i18n/locales/zh-CN.ts
const zhCN = {
	usage: "用法:\n  zip-dist [input]\n",
	options: [
		"选项:",
		"  -o, --output <dir>      输出目录（默认：当前目录）",
		"  -n, --name <name>       输出文件名（默认：<输入目录名>.<扩展名>）",
		"  -f, --format <format>   压缩格式：zip | tar | tgz | 7z（默认：zip）",
		"  -l, --level <1-9>       压缩等级（默认：9）",
		"      --lang <lang>       语言：zh-CN | en（默认：自动）",
		"  -h, --help              显示帮助"
	].join("\n"),
	outputDirMissingValue: "{flag} 需要一个参数值",
	invalidNumber: "压缩等级必须是数字: {value}",
	invalidLevelRange: "压缩等级必须在 1-9 之间",
	invalidFormat: "不支持的格式: {value}，可选 zip | tar | tgz | 7z",
	invalidLang: "不支持的语言: {value}，可选 zh-CN | en",
	unknownOption: "未知参数: {value}",
	inputNotExist: "输入目录不存在: {value}",
	inputMustDirectory: "输入路径必须是目录: {value}",
	defaultDistMissing: "未提供输入目录，且未找到 dist 目录: {value}",
	compressing: "压缩中",
	done: "压缩完成: {value}",
	size: "大小: {value}",
	warning: "警告: {value}",
	failed: "失败: {value}",
	files: "文件"
};
//#endregion
//#region src/i18n/index.ts
const dictionaries = {
	en,
	"zh-CN": zhCN
};
function normalizeLang(input) {
	if (!input) return void 0;
	const value = input.toLowerCase();
	if (value === "en") return "en";
	if (value === "zh-cn" || value === "zh" || value === "cn") return "zh-CN";
}
function detectLang(env) {
	return `${env.LANG ?? ""}${env.LC_ALL ?? ""}${Intl.DateTimeFormat().resolvedOptions().locale ?? ""}`.toLowerCase().includes("zh") ? "zh-CN" : "en";
}
function createI18n(lang) {
	const dict = dictionaries[lang];
	return {
		lang,
		t(key, vars) {
			let template = dict[key] ?? key;
			if (!vars) return template;
			for (const [k, v] of Object.entries(vars)) template = template.replaceAll(`{${k}}`, String(v));
			return template;
		}
	};
}
//#endregion
//#region src/cli/parseArgs.ts
const formats = new Set([
	"zip",
	"tar",
	"tgz",
	"7z"
]);
function parseArgs(argv, cwd) {
	const options = {
		outputDir: cwd,
		level: 9,
		format: "zip",
		help: false
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
			options.outputDir = resolvePath(requireValue(argv, i + 1, arg), cwd);
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
			if (!Number.isFinite(level)) throw new CliError("invalidNumber", { value });
			options.level = level;
			i += 2;
			continue;
		}
		if (arg === "-f" || arg === "--format") {
			const value = requireValue(argv, i + 1, arg);
			if (!formats.has(value)) throw new CliError("invalidFormat", { value });
			options.format = value;
			i += 2;
			continue;
		}
		if (arg === "--lang") {
			const value = requireValue(argv, i + 1, arg);
			const lang = normalizeLang(value);
			if (!lang) throw new CliError("invalidLang", { value });
			options.lang = lang;
			i += 2;
			continue;
		}
		if (arg.startsWith("-")) throw new CliError("unknownOption", { value: arg });
		if (!options.inputArg) {
			options.inputArg = arg;
			i += 1;
			continue;
		}
		throw new CliError("unknownOption", { value: arg });
	}
	if (options.level < 1 || options.level > 9) throw new CliError("invalidLevelRange");
	return options;
}
function requireValue(argv, index, flag) {
	const value = argv[index];
	if (!value || value.startsWith("-")) throw new CliError("outputDirMissingValue", { flag });
	return value;
}
function resolvePath(target, cwd) {
	return node_path.default.isAbsolute(target) ? target : node_path.default.resolve(cwd, target);
}
//#endregion
//#region src/core/output.ts
const extensions = {
	zip: ".zip",
	tar: ".tar",
	tgz: ".tar.gz",
	"7z": ".7z"
};
function getExtension(format) {
	return extensions[format];
}
function buildOutputFileName(inputDir, format, explicitName) {
	if (explicitName) return explicitName;
	return `${node_path.default.basename(inputDir)}${getExtension(format)}`;
}
//#endregion
//#region src/compress/fileOps.ts
function moveFileSafe(from, to) {
	node_fs.default.mkdirSync(node_path.default.dirname(to), { recursive: true });
	try {
		node_fs.default.renameSync(from, to);
	} catch {
		node_fs.default.copyFileSync(from, to);
		node_fs.default.unlinkSync(from);
	}
}
//#endregion
//#region src/compress/archiverAdapter.ts
async function compressWithArchiver(params) {
	const { inputDir, outFile, level, format, onProgress, onWarning } = params;
	const kind = format === "zip" ? "zip" : "tar";
	const totals = computeDirStats(inputDir);
	const tmpFile = node_path.default.join(node_os.default.tmpdir(), `zip-dist-${Date.now()}-${Math.random().toString(16).slice(2)}${getExtension(format)}`);
	const output = node_fs.default.createWriteStream(tmpFile);
	let filesProcessed = 0;
	let processedBytes = 0;
	const archive = (0, archiver.default)(kind, {
		zlib: { level },
		gzip: format === "tgz",
		gzipOptions: { level }
	});
	archive.on("warning", (warn) => onWarning(String(warn?.message ?? warn)));
	archive.on("entry", (entry) => {
		if (entry?.type !== "directory") filesProcessed += 1;
	});
	archive.on("progress", (progress) => {
		processedBytes = progress.fs.processedBytes || processedBytes;
		onProgress({
			filesProcessed,
			filesTotal: totals.filesTotal,
			processedBytes,
			totalBytes: totals.bytesTotal,
			percent: totals.bytesTotal > 0 ? Math.min(99.9, processedBytes / totals.bytesTotal * 100) : totals.filesTotal > 0 ? Math.min(99.9, filesProcessed / totals.filesTotal * 100) : void 0
		});
	});
	const done = new Promise((resolve, reject) => {
		output.on("close", () => resolve(archive.pointer()));
		output.on("error", reject);
		archive.on("error", reject);
	});
	archive.pipe(output);
	archive.directory(inputDir, false);
	archive.finalize();
	const bytes = await done;
	onProgress({
		filesProcessed: totals.filesTotal,
		filesTotal: totals.filesTotal,
		processedBytes: totals.bytesTotal > 0 ? totals.bytesTotal : bytes,
		totalBytes: totals.bytesTotal > 0 ? totals.bytesTotal : bytes,
		percent: 100
	});
	moveFileSafe(tmpFile, outFile);
	return bytes;
}
function computeDirStats(rootDir) {
	let filesTotal = 0;
	let bytesTotal = 0;
	const stack = [rootDir];
	while (stack.length > 0) {
		const current = stack.pop();
		if (!current) break;
		const entries = node_fs.default.readdirSync(current, { withFileTypes: true });
		for (const entry of entries) {
			const fullPath = node_path.default.join(current, entry.name);
			try {
				if (entry.isDirectory()) {
					stack.push(fullPath);
					continue;
				}
				if (entry.isFile()) {
					filesTotal += 1;
					bytesTotal += node_fs.default.statSync(fullPath).size;
				}
			} catch {}
		}
	}
	return {
		filesTotal,
		bytesTotal
	};
}
//#endregion
//#region src/compress/sevenZipAdapter.ts
async function compressWith7z(params) {
	const { inputDir, outFile, level, onProgress } = params;
	const tmpFile = node_path.default.join(node_os.default.tmpdir(), `zip-dist-${Date.now()}-${Math.random().toString(16).slice(2)}.7z`);
	await new Promise((resolve, reject) => {
		const child = (0, node_child_process.spawn)(_7zip_bin.path7za, [
			"a",
			"-bsp1",
			"-t7z",
			tmpFile,
			".",
			`-mx=${level}`
		], {
			cwd: inputDir,
			stdio: [
				"ignore",
				"pipe",
				"pipe"
			]
		});
		let lastPercent = 0;
		let pending = "";
		const consume = (chunk) => {
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
			} else reject(/* @__PURE__ */ new Error(`7z exited with code ${code ?? "unknown"}`));
		});
	});
	moveFileSafe(tmpFile, outFile);
	return node_fs.default.statSync(outFile).size;
}
//#endregion
//#region src/compress/index.ts
async function compress(params) {
	if (params.format === "7z") return compressWith7z(params);
	return compressWithArchiver(params);
}
//#endregion
//#region src/core/resolveInput.ts
function resolveInputDir(inputArg, cwd) {
	if (inputArg) return {
		inputDir: node_path.default.isAbsolute(inputArg) ? inputArg : node_path.default.resolve(cwd, inputArg),
		usedDefaultDist: false
	};
	return {
		inputDir: node_path.default.resolve(cwd, "dist"),
		usedDefaultDist: true
	};
}
function validateInputDir(inputDir, usedDefaultDist) {
	if (!node_fs.default.existsSync(inputDir)) {
		if (usedDefaultDist) throw new CliError("defaultDistMissing", { value: inputDir });
		throw new CliError("inputNotExist", { value: inputDir });
	}
	if (!node_fs.default.statSync(inputDir).isDirectory()) throw new CliError("inputMustDirectory", { value: inputDir });
}
//#endregion
//#region src/utils/size.ts
const UNITS = [
	"B",
	"KB",
	"MB",
	"GB",
	"TB"
];
function formatBytes(bytes) {
	if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
	let value = bytes;
	let unitIndex = 0;
	while (value >= 1024 && unitIndex < UNITS.length - 1) {
		value /= 1024;
		unitIndex += 1;
	}
	if (unitIndex === 0) return `${Math.round(value)} ${UNITS[unitIndex]}`;
	const precision = value >= 100 ? 0 : value >= 10 ? 1 : 2;
	return `${value.toFixed(precision)} ${UNITS[unitIndex]}`;
}
//#endregion
//#region src/ui/progress.ts
var ProgressReporter = class {
	enabled;
	label;
	filesText;
	stopped = false;
	lastRenderedAt = 0;
	constructor(label, filesText) {
		this.enabled = Boolean(process.stdout.isTTY);
		this.label = label;
		this.filesText = filesText;
	}
	update(state) {
		if (!this.enabled || this.stopped) return;
		const now = Date.now();
		if (now - this.lastRenderedAt < 120) return;
		this.lastRenderedAt = now;
		const percent = state.percent ?? this.computePercent(state);
		const boundedPercent = Math.max(0, Math.min(100, percent));
		const barWidth = 24;
		const filled = Math.round(boundedPercent / 100 * barWidth);
		const bar = `${"#".repeat(filled)}${"-".repeat(Math.max(0, barWidth - filled))}`;
		const filePart = typeof state.filesProcessed === "number" ? typeof state.filesTotal === "number" ? `${state.filesProcessed}/${state.filesTotal} ${this.filesText}` : `${state.filesProcessed} ${this.filesText}` : "";
		const sizePart = typeof state.processedBytes === "number" ? typeof state.totalBytes === "number" && state.totalBytes > 0 ? `${formatBytes(state.processedBytes)} / ${formatBytes(state.totalBytes)}` : formatBytes(state.processedBytes) : "";
		const line = `${this.label} ${boundedPercent.toFixed(1)}% [${bar}] ${filePart} ${sizePart}`.trim();
		node_readline.default.clearLine(process.stdout, 0);
		node_readline.default.cursorTo(process.stdout, 0);
		process.stdout.write(line);
	}
	stop() {
		if (!this.enabled || this.stopped) return;
		this.stopped = true;
		node_readline.default.clearLine(process.stdout, 0);
		node_readline.default.cursorTo(process.stdout, 0);
	}
	computePercent(state) {
		if (typeof state.processedBytes === "number" && typeof state.totalBytes === "number" && state.totalBytes > 0) return state.processedBytes / state.totalBytes * 100;
		if (typeof state.filesProcessed === "number" && typeof state.filesTotal === "number" && state.filesTotal > 0) return state.filesProcessed / state.filesTotal * 100;
		return 0;
	}
};
//#endregion
//#region src/app.ts
async function run(argv, env = process.env) {
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
		const outFile = node_path.default.join(options.outputDir, outName);
		const reporter = new ProgressReporter(i18n.t("compressing"), i18n.t("files"));
		const bytes = await compress({
			inputDir,
			outFile,
			level: options.level,
			format: options.format,
			onProgress: (state) => reporter.update(state),
			onWarning: (msg) => console.warn(i18n.t("warning", { value: msg }))
		});
		reporter.stop();
		console.log(i18n.t("done", { value: outFile }));
		console.log(i18n.t("size", { value: formatBytes(bytes) }));
		return 0;
	} catch (err) {
		return printError(err, lang);
	}
}
function printError(err, lang) {
	const i18n = createI18n(lang);
	if (err instanceof CliError) {
		const message = i18n.t(err.key, err.vars);
		console.error(i18n.t("failed", { value: message }));
		return err.exitCode;
	}
	const message = err instanceof Error ? err.message : String(err);
	console.error(i18n.t("failed", { value: message }));
	return 1;
}
//#endregion
Object.defineProperty(exports, "run", {
	enumerable: true,
	get: function() {
		return run;
	}
});
