import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import fsp from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";

const repoRoot = path.resolve(process.cwd());
const cliPath = path.join(repoRoot, "bin", "zip-dist.cjs");

async function withTempDir(fn) {
  const dir = await fsp.mkdtemp(path.join(os.tmpdir(), "zip-dist-test-"));
  try {
    return await fn(dir);
  } finally {
    await fsp.rm(dir, { recursive: true, force: true });
  }
}

function runCli(args, cwd) {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, [cliPath, ...args], {
      cwd,
      stdio: ["ignore", "pipe", "pipe"],
      env: { ...process.env, LANG: "en" },
    });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (c) => {
      stdout += c.toString("utf8");
    });
    child.stderr.on("data", (c) => {
      stderr += c.toString("utf8");
    });
    child.on("close", (code) => resolve({ code: code ?? 1, stdout, stderr }));
  });
}

test("defaults to ./dist when input is not provided", async () => {
  await withTempDir(async (cwd) => {
    const dist = path.join(cwd, "dist");
    await fsp.mkdir(dist, { recursive: true });
    await fsp.writeFile(path.join(dist, "a.txt"), "hello");

    const result = await runCli([], cwd);
    assert.equal(result.code, 0, result.stderr);
    const outFile = path.join(cwd, "dist.zip");
    assert.equal(fs.existsSync(outFile), true);
    const st = await fsp.stat(outFile);
    assert.ok(st.size > 0);
  });
});

test("returns error when default dist folder does not exist", async () => {
  await withTempDir(async (cwd) => {
    const result = await runCli(["--lang", "en"], cwd);
    assert.equal(result.code, 1);
    assert.match(result.stderr, /dist folder was not found/i);
  });
});

test("uses input folder name as default output filename", async () => {
  await withTempDir(async (cwd) => {
    const input = path.join(cwd, "build-output");
    await fsp.mkdir(input, { recursive: true });
    await fsp.writeFile(path.join(input, "file.txt"), "content");

    const result = await runCli(["build-output"], cwd);
    assert.equal(result.code, 0, result.stderr);
    assert.equal(fs.existsSync(path.join(cwd, "build-output.zip")), true);
  });
});

test("supports tar, tgz and 7z formats", async () => {
  await withTempDir(async (cwd) => {
    const input = path.join(cwd, "dist");
    await fsp.mkdir(input, { recursive: true });
    await fsp.writeFile(path.join(input, "x.txt"), "x");

    const tarResult = await runCli(["dist", "-f", "tar"], cwd);
    assert.equal(tarResult.code, 0, tarResult.stderr);
    assert.equal(fs.existsSync(path.join(cwd, "dist.tar")), true);

    const tgzResult = await runCli(["dist", "-f", "tgz"], cwd);
    assert.equal(tgzResult.code, 0, tgzResult.stderr);
    assert.equal(fs.existsSync(path.join(cwd, "dist.tar.gz")), true);

    const z7Result = await runCli(["dist", "-f", "7z"], cwd);
    assert.equal(z7Result.code, 0, z7Result.stderr);
    assert.equal(fs.existsSync(path.join(cwd, "dist.7z")), true);
  });
});

test("supports explicit language option", async () => {
  await withTempDir(async (cwd) => {
    const result = await runCli(["--lang", "en", "--help"], cwd);
    assert.equal(result.code, 0);
    assert.match(result.stdout, /Usage:/);
    assert.match(result.stdout, /Archive format/);
  });
});

test("shows adaptive size unit for small archives", async () => {
  await withTempDir(async (cwd) => {
    const input = path.join(cwd, "dist");
    await fsp.mkdir(input, { recursive: true });
    await fsp.writeFile(path.join(input, "tiny.txt"), "x");

    const result = await runCli(["--lang", "en"], cwd);
    assert.equal(result.code, 0, result.stderr);
    assert.match(result.stdout, /Size:\s+\d+(\.\d+)?\s(B|KB)/);
    assert.doesNotMatch(result.stdout, /Size:\s+\d+(\.\d+)?\sMB/);
  });
});
