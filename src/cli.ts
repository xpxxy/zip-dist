import { run } from "./app.js";

export async function runCli(): Promise<void> {
  const code = await run(process.argv.slice(2), process.env);
  process.exitCode = code;
}
