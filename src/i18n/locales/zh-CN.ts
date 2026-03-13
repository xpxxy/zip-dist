const zhCN = {
  usage: "用法:\n  zip-dist [input]\n",
  options: [
    "选项:",
    "  -o, --output <dir>      输出目录（默认：当前目录）",
    "  -n, --name <name>       输出文件名（默认：<输入目录名>.<扩展名>）",
    "  -f, --format <format>   压缩格式：zip | tar | tgz | 7z（默认：zip）",
    "  -l, --level <1-9>       压缩等级（默认：9）",
    "      --lang <lang>       语言：zh-CN | en（默认：自动）",
    "  -h, --help              显示帮助",
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
  files: "文件",
};

export default zhCN;
