export class CliError extends Error {
  constructor(
    public readonly key: string,
    public readonly vars: Record<string, string | number> = {},
    public readonly exitCode = 1,
  ) {
    super(key);
    this.name = "CliError";
  }
}
