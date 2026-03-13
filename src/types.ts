export type ArchiveFormat = "zip" | "tar" | "tgz" | "7z";
export type Lang = "zh-CN" | "en";

export interface CliOptions {
  inputArg?: string;
  outputDir: string;
  name?: string;
  level: number;
  format: ArchiveFormat;
  lang?: Lang;
  help: boolean;
}

export interface ProgressState {
  filesProcessed?: number;
  filesTotal?: number;
  processedBytes?: number;
  totalBytes?: number;
  percent?: number;
}

export interface CompressParams {
  inputDir: string;
  outFile: string;
  level: number;
  format: ArchiveFormat;
  onProgress: (state: ProgressState) => void;
  onWarning: (message: string) => void;
}
