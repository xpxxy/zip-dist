# zip-dist

### Docs

[CN](./readme.md) | [EN](./readme.en.md)

### Install

```bash
npm i -g @xpxxy/zip-dist
```

### Usage

```bash
zip-dist [input]
```

### Options:

```bash
-o, --output <dir>      # Output directory (default: current directory)
-n, --name <name>       # Output file name (default: <input-folder>.<ext>)
-f, --format <format>   # Format: zip | tar | tgz | 7z (default: zip)
-l, --level <1-9>       # Compression level (default: 9)
    --lang <lang>       # Language: zh-CN | en (default: auto)
-h, --help
```

### Default behavior

- If `input` is omitted, `./dist` is used automatically.
- If `./dist` does not exist, no file will be processed.
- Default output name is `<input-folder>.<format-extension>`.

### Dev

```bash
npm run build
npm run typecheck
npm run lint
npm run format
npm test
```
