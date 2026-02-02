#!/usr/bin/env node
import fs from "fs";
import os from "os";
import path from "path";
import archiver from "archiver";
import process from "process";
import readline from "readline";

/**
 * 解析参数
 */
const args = process.argv.slice(2);
if (!args.length || args.includes("-h") || args.includes("--help")) {
  printHelp();
  process.exit(0);
}

const inputPath = resolvePath(args[0]);

const options = {
  output: process.cwd(),
  name: "dist.zip",
  level: 9,
};

for (let i = 1; i < args.length; i++) {
  const arg = args[i];
  if (arg === "-o" || arg === "--output") {
    options.output = resolvePath(requireValue(args, ++i, arg));
  } else if (arg === "-n" || arg === "--name") {
    options.name = requireValue(args, ++i, arg);
  } else if (arg === "-l" || arg === "--level") {
    const raw = requireValue(args, ++i, arg);
    const level = Number(raw);
    if (!Number.isFinite(level)) {
      exit(`压缩等级必须是数字: ${raw}`);
    }
    options.level = level;
  }
}

validate(inputPath, options);
zip(inputPath, options);

/* ------------------ functions ------------------ */

function resolvePath(p) {
  return path.isAbsolute(p) ? p : path.resolve(process.cwd(), p);
}

function validate(input, opts) {
  if (!fs.existsSync(input)) {
    exit(`输入路径不存在: ${input}`);
  }
  if (!fs.statSync(input).isDirectory()) {
    exit(`输入路径必须是目录`);
  }
  if (opts.level < 1 || opts.level > 9) {
    exit(`压缩等级必须在 1-9 之间`);
  }
}

function zip(input, opts) {
  fs.mkdirSync(opts.output, { recursive: true });

  const outFile = path.join(opts.output, opts.name);
  // 避免“输出 zip 在输入目录内”导致把 zip 自己也压进去，从而卡住/异常
  const tmpFile = path.join(
    os.tmpdir(),
    `zip-dist-${Date.now()}-${Math.random().toString(16).slice(2)}.zip`
  );
  const output = fs.createWriteStream(tmpFile);

  const archive = archiver("zip", {
    zlib: { level: opts.level },
  });

  // 预先统计目录的总文件数/总字节数，以提供更稳定的百分比
  const { filesTotal, bytesTotal } = computeDirStats(input);
  let filesProcessed = 0;
  let lastProcessedBytes = 0;

  const stopProgress = createProgressRenderer();
  archive.on("progress", (p) => {
    lastProcessedBytes = p.fs?.processedBytes ?? lastProcessedBytes;
    stopProgress.render({
      filesProcessed,
      filesTotal,
      processedBytes: lastProcessedBytes,
      totalBytes: bytesTotal,
    });
  });
  archive.on("entry", (data) => {
    if (data?.type !== "directory") {
      filesProcessed++;
      stopProgress.render({
        filesProcessed,
        filesTotal,
        processedBytes: lastProcessedBytes,
        totalBytes: bytesTotal,
      });
    }
  });

  archive.pipe(output);
  archive.directory(input, false);
  archive.finalize();

  output.on("close", () => {
    stopProgress.stop();

    try {
      fs.mkdirSync(path.dirname(outFile), { recursive: true });
      try {
        fs.renameSync(tmpFile, outFile);
      } catch (err) {
        // 跨盘符/权限等导致 rename 失败时回退到 copy+unlink
        fs.copyFileSync(tmpFile, outFile);
        fs.unlinkSync(tmpFile);
      }
    } catch (err) {
      exit(err);
    }

    console.log(`✅ 压缩完成: ${outFile}`);
    console.log(`📦 大小: ${(archive.pointer() / 1024 / 1024).toFixed(2)} MB`);
  });

  archive.on("error", (err) => {
    stopProgress.stop();
    exit(err);
  });

  archive.on("warning", (warn) => {
    // 非致命警告，例如文件权限或缺失
    console.warn(`⚠️ 警告: ${warn?.message || warn}`);
  });

  output.on("error", (err) => {
    stopProgress.stop();
    exit(err);
  });
}

function printHelp() {
  console.log(`
Usage:
  zip-dist <input>

Options:
  -o, --output <dir>    输出目录（默认：当前目录）
  -n, --name <name>     文件名（默认：dist.zip）
  -l, --level <1-9>     压缩等级（默认：9）
`);
}

function exit(msg) {
  const text = msg instanceof Error ? msg.message : String(msg);
  console.error(`❌ ${text}`);
  process.exit(1);
}

function requireValue(argv, index, flag) {
  const value = argv[index];
  if (!value || value.startsWith("-")) {
    exit(`${flag} 需要一个参数值`);
  }
  return value;
}

function createProgressRenderer() {
  const enabled = Boolean(process.stdout.isTTY);
  let lastRenderedAt = 0;
  let stopped = false;

  function render(payload) {
    if (!enabled || stopped) return;

    const now = Date.now();
    // 避免刷屏：最多 12 FPS
    if (now - lastRenderedAt < 80) return;
    lastRenderedAt = now;

    const filesProcessed = payload?.filesProcessed ?? 0;
    const filesTotal = payload?.filesTotal ?? 0;
    const bytes = payload?.processedBytes ?? 0;
    const bytesTotal = payload?.totalBytes ?? 0;

    const percent = bytesTotal > 0 ? bytes / bytesTotal : 0;
    const pctText = bytesTotal > 0 ? `${Math.min(100, Math.max(0, percent * 100)).toFixed(1)}%` : "--%";

    const barWidth = 28;
    const filled = Math.round(percent * barWidth);
    const bar = `${"█".repeat(Math.max(0, Math.min(barWidth, filled)))}${"░".repeat(Math.max(0, barWidth - filled))}`;

    const filePart = filesTotal > 0 ? `${filesProcessed}/${filesTotal} 文件` : `${filesProcessed} 文件`;
    const sizePart = bytes > 0 ? `, ${(bytes / 1024 / 1024).toFixed(1)}MB` : "";
    const line = `⏳ 压缩中 ${pctText} [${bar}] ${filePart}${sizePart}`;

    readline.clearLine(process.stdout, 0);
    readline.cursorTo(process.stdout, 0);
    process.stdout.write(line);
  }

  function stop() {
    if (!enabled || stopped) return;
    stopped = true;
    readline.clearLine(process.stdout, 0);
    readline.cursorTo(process.stdout, 0);
  }

  return { render, stop };
}

function computeDirStats(rootDir) {
  let filesTotal = 0;
  let bytesTotal = 0;
  try {
    const stack = [rootDir];
    while (stack.length) {
      const dir = stack.pop();
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const ent of entries) {
        const full = path.join(dir, ent.name);
        try {
          if (ent.isDirectory()) {
            stack.push(full);
          } else if (ent.isFile()) {
            filesTotal += 1;
            const st = fs.statSync(full);
            bytesTotal += st.size || 0;
          }
        } catch {
          // 跳过不可访问或临时文件错误
        }
      }
    }
  } catch {
    // 统计失败则退回未知总量，仅显示 processed
    filesTotal = 0;
    bytesTotal = 0;
  }
  return { filesTotal, bytesTotal };
}
