Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const require_app = require("./app-DTlhmOyr.cjs");
//#region src/cli.ts
async function runCli() {
	const code = await require_app.run(process.argv.slice(2), process.env);
	process.exitCode = code;
}
//#endregion
exports.runCli = runCli;
