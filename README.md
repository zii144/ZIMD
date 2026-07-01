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
- **Rich rendering** — syntax-highlighted code (theme-aware) with one-click
  copy, tables, task lists, KaTeX math, Mermaid diagrams (lazily loaded), and
  local images resolved relative to each document.
- **In-app navigation** — command palette (`⌘K`) for fuzzy file-jump and actions;
  relative `.md` links open inside the reader; in-document find (`⌘F`) with match
  cycling; per-file reading-position memory.
- **Focus mode** — dims everything but the passage at your reading line for
  distraction-free reading.
- **Live reload** — edit a file in any editor and ZIMD re-renders it instantly;
  the file tree updates as files are added or removed.
- **Reading controls** — adjustable text size, sans/serif toggle, light/dark
  theme, word-count &amp; reading-time, and a slim reading-progress indicator.
- **Quiet by design** — soft elevation, hairline borders, gentle motion, and a
  custom overlay title bar.

## Tech

Tauri 2 (Rust) · Svelte 5 · Vite 6 · markdown-it · highlight.js · KaTeX · Mermaid.

Runs on **macOS, Windows, and Linux**. On macOS the native traffic-light
controls sit over an overlay title bar; on Windows and Linux ZIMD draws its own
minimal window controls (minimize / maximize / close). Typography and keyboard
hints adapt to each platform automatically.

## Prerequisites (all platforms)

- **Rust** (stable ≥ 1.87) via [rustup](https://rustup.rs).
- **Node.js 18+** (20/22 recommended).

Plus the platform-specific system dependencies below.

### macOS

```bash
xcode-select --install
```

### Windows

- **Microsoft C++ Build Tools** (or Visual Studio 2022 with the “Desktop
  development with C++” workload).
- **WebView2 Runtime** — preinstalled on Windows 11; on Windows 10 install it
  from Microsoft’s Evergreen distributable.

### Linux

Install the WebKitGTK and build dependencies (Debian/Ubuntu shown):

```bash
sudo apt update
sudo apt install libwebkit2gtk-4.1-dev build-essential curl wget file \
  libxdo-dev libssl-dev libayatana-appindicator3-dev librsvg2-dev
```

(For Fedora/Arch, install the equivalent `webkit2gtk4.1`, `openssl`, and
`librsvg2` development packages.)

## Run in development

```bash
npm install
npm run tauri dev
```

The first launch compiles the Rust shell, so give it a moment. Subsequent
launches are fast.

> Try it immediately: once the window opens, click **Open a folder** and choose
> the included `sample/` folder.

## Testing

Frontend unit tests (Vitest) cover the pure logic — path resolution, the
Markdown pipeline (TOC, mermaid routing, task lists, math, highlighting), and
reading-position memory:

```bash
npm test          # run once
npm run test:watch
```

Backend unit tests (Rust) cover the file-tree walker and Markdown detection:

```bash
cd src-tauri && cargo test
```

## Build a release app

```bash
npm run tauri build
```

Installers are written to `src-tauri/target/release/bundle/`:

- **macOS** — `.app` and `.dmg`
- **Windows** — `.msi` (WiX) and `.exe` (NSIS)
- **Linux** — `.deb`, `.rpm`, and `.AppImage`

Each platform must be built on (or cross-compiled for) that platform.

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
| `⌘K`           | Command palette     |
| `⌘F`           | Find in document    |
| `⇧⌘V`          | Paste content       |
| `⌘B`           | Toggle sidebar      |
| `⌘\`           | Toggle contents     |
| `⌘ +` / `⌘ −`  | Adjust reading size |
| `⌘0`           | Reset reading size  |

---

<div align="center"><sub>Designed & developed by Zii · v0.1.0</sub></div>
