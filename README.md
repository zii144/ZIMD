<div align="center">

# ZIMD

**A luxury local Markdown viewer for immersive reading.**

Designed & developed by Zii.

</div>

---

ZIMD is a calm, native desktop reader for your local Markdown library. It pairs
a Nordic-minimal interface with careful reading typography: a comfortable
measure, generous leading, a single restrained accent, and both a daylight and
a nightfall theme.

## Features

- **Folder library** — open any folder and browse its Markdown in a collapsible,
  filterable file tree (folders first, then files).
- **Table of contents** — auto-generated from headings, scroll-synced, click to
  jump.
- **Rich rendering** — syntax-highlighted code (theme-aware), tables, task
  lists, KaTeX math, and Mermaid diagrams (lazily loaded).
- **Reading controls** — adjustable text size, sans/serif toggle, light/dark
  theme, and a slim reading-progress indicator.
- **Quiet by design** — soft elevation, hairline borders, gentle motion, and a
  custom overlay title bar.

## Tech

Tauri 2 (Rust) · Svelte 5 · Vite 6 · markdown-it · highlight.js · KaTeX · Mermaid.

## Prerequisites (macOS)

1. **Rust** — install via [rustup](https://rustup.rs):
   ```bash
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   ```
2. **Xcode Command Line Tools**:
   ```bash
   xcode-select --install
   ```
3. **Node.js 18+** (Node 20/22 recommended).

## Run in development

```bash
npm install
npm run tauri dev
```

The first launch compiles the Rust shell, so give it a moment. Subsequent
launches are fast.

> Try it immediately: once the window opens, click **Open a folder** and choose
> the included `sample/` folder.

## Build a release app

```bash
npm run tauri build
```

The signed-or-unsigned `.app` / `.dmg` is written to
`src-tauri/target/release/bundle/`.

## Regenerate the icon

The icon set lives in `src-tauri/icons/`. To regenerate from a 1024×1024 PNG:

```bash
npm run tauri icon path/to/icon.png
```

## Project layout

```
ZIMD/
├── index.html
├── src/                      # Svelte frontend
│   ├── app.css               # Design tokens (light + dark)
│   ├── prose.css             # Reading typography
│   ├── hljs.css              # Theme-aware syntax palette
│   ├── App.svelte            # App shell, layout, shortcuts
│   └── lib/
│       ├── markdown.ts       # markdown-it + math + mermaid + TOC
│       ├── fs.ts             # Tauri bridge (dialog + file reads)
│       ├── stores.ts         # App state (persisted settings)
│       └── components/       # TitleBar, Sidebar, FileTree, TOC, Reader, Welcome
├── src-tauri/                # Rust backend
│   ├── src/lib.rs            # read_tree / read_file commands
│   ├── tauri.conf.json
│   └── capabilities/
└── sample/                   # A demo document to read
```

## Keyboard shortcuts

| Shortcut       | Action              |
| -------------- | ------------------- |
| `⌘O`           | Open folder         |
| `⌘B`           | Toggle sidebar      |
| `⌘\`           | Toggle contents     |
| `⌘ +` / `⌘ −`  | Adjust reading size |
| `⌘0`           | Reset reading size  |

---

<div align="center"><sub>Designed & developed by Zii · v0.1.0</sub></div>
