# zip-dist
[![NPM](https://nodei.co/npm/@xpxxy/zip-dist.svg?style=shields&data=n,v,u,d,s&color=brightgreen)](https://nodei.co/npm/@xpxxy/zip-dist/)
### 文档

[CN](./readme.md) | [EN](./readme.en.md)

### 安装

```bash
npm i -g @xpxxy/zip-dist
```

### 基本用法

```bash
zip-dist [input]
```

### 参数:

```bash
-o, --output <dir>      #输出目录（默认：当前目录）
-n, --name <name>       #输出文件名（默认：<输入目录名>.<扩展名>）
-f, --format <format>   #格式：zip | tar | tgz | 7z（默认：zip）
-l, --level <1-9>       #压缩等级（默认：9）
    --lang <lang>       #语言：zh-CN | en（默认：自动识别）
-h, --help
```

### 默认行为

- 不传入 `input` 时，默认压缩当前目录下的 `dist`。
- 如果当前目录没有 `dist`，不执行压缩。
- 默认输出文件名为 `<输入目录名>.<格式扩展名>`。

### 开发

```bash
npm run build
npm run typecheck
npm run lint
npm run format
npm test
```
