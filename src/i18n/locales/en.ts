const en = {
  usage: "Usage:\n  zip-dist [input]\n",
  options: [
    "Options:",
    "  -o, --output <dir>      Output directory (default: current directory)",
    "  -n, --name <name>       Output archive name (default: <inputFolder>.<ext>)",
    "  -f, --format <format>   Archive format: zip | tar | tgz | 7z (default: zip)",
    "  -l, --level <1-9>       Compression level (default: 9)",
    "      --lang <lang>       Language: zh-CN | en (default: auto)",
    "  -h, --help              Show help",
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
  files: "files",
};

export default en;
