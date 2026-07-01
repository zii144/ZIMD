<script lang="ts">
  import { onMount } from "svelte";
  import {
    settings,
    rootFolder,
    fileTree,
    currentFile,
    docOpen,
    docTitle,
    renderedHtml,
    toc,
    errorMsg,
    loading,
  } from "./lib/stores";
  import {
    isTauri,
    pickFolder,
    readTree,
    readFile,
    watchPath,
  } from "./lib/fs";
  import { listen, type UnlistenFn } from "@tauri-apps/api/event";
  import { renderMarkdown } from "./lib/markdown";
  import TitleBar from "./lib/components/TitleBar.svelte";
  import Sidebar from "./lib/components/Sidebar.svelte";
  import TableOfContents from "./lib/components/TableOfContents.svelte";
  import Reader from "./lib/components/Reader.svelte";
  import Welcome from "./lib/components/Welcome.svelte";
  import PasteModal from "./lib/components/PasteModal.svelte";
  import CommandPalette from "./lib/components/CommandPalette.svelte";
  import { modKey } from "./lib/platform";
  import { t, locale, locales, setLocale } from "./lib/i18n";
  import type { FileNode, PaletteCommand, PaletteFile } from "./lib/types";

  let reader = $state<Reader>();
  let pasteOpen = $state(false);
  let paletteOpen = $state(false);
  let toast = $state<string | null>(null);

  function flattenTree(nodes: FileNode[], acc: PaletteFile[] = []): PaletteFile[] {
    for (const n of nodes) {
      if (n.is_dir && n.children) flattenTree(n.children, acc);
      else if (!n.is_dir) acc.push({ name: n.name, path: n.path });
    }
    return acc;
  }
  const paletteFiles = $derived(flattenTree($fileTree));

  const paletteCommands = $derived.by<PaletteCommand[]>(() => {
    const tr = $t;
    const cmds: PaletteCommand[] = [
      {
        id: "theme",
        title: $settings.theme === "dark" ? tr("cmd.toLight") : tr("cmd.toDark"),
        icon: $settings.theme === "dark" ? "sun" : "moon",
        run: () =>
          settings.update((s) => ({ ...s, theme: s.theme === "dark" ? "light" : "dark" })),
      },
      {
        id: "focus",
        title: $settings.focus ? tr("cmd.focusOff") : tr("cmd.focusOn"),
        icon: "book",
        run: () => settings.update((s) => ({ ...s, focus: !s.focus })),
      },
      {
        id: "sidebar",
        title: tr("cmd.sidebar"),
        hint: `${modKey} B`,
        icon: "sidebar",
        run: () => settings.update((s) => ({ ...s, sidebarOpen: !s.sidebarOpen })),
      },
      {
        id: "toc",
        title: tr("cmd.contents"),
        hint: `${modKey} \\`,
        icon: "toc",
        run: () => settings.update((s) => ({ ...s, tocOpen: !s.tocOpen })),
      },
      {
        id: "open",
        title: tr("cmd.open"),
        hint: `${modKey} O`,
        icon: "folder",
        run: chooseFolder,
      },
      {
        id: "paste",
        title: tr("cmd.paste"),
        hint: `⇧ ${modKey} V`,
        icon: "paste",
        run: () => (pasteOpen = true),
      },
    ];
    if ($docOpen) {
      cmds.splice(2, 0, {
        id: "find",
        title: tr("cmd.find"),
        hint: `${modKey} F`,
        icon: "search",
        run: () => reader?.openFind(),
      });
    }
    // Language switchers.
    for (const l of locales) {
      cmds.push({
        id: `lang-${l.code}`,
        title: `${tr("cmd.language")} ${l.name}`,
        icon: "command",
        hint: l.code === $locale ? "✓" : undefined,
        run: () => setLocale(l.code),
      });
    }
    return cmds;
  });
  let toastTimer: ReturnType<typeof setTimeout>;

  // Apply theme to <html>.
  $effect(() => {
    document.documentElement.setAttribute("data-theme", $settings.theme);
  });

  // Surface errors as a transient toast.
  $effect(() => {
    if ($errorMsg) flash($errorMsg);
  });

  function flash(msg: string) {
    toast = msg;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => (toast = null), 3200);
    errorMsg.set(null);
  }

  async function loadTree(path: string) {
    if (!isTauri()) return;
    try {
      fileTree.set(await readTree(path));
      watchPath(path).catch(() => {});
    } catch (e) {
      errorMsg.set(String(e));
      fileTree.set([]);
    }
  }

  // ---- Live reload on external file changes ----
  const norm = (p: string) => p.replace(/\\/g, "/");
  let fsTimer: ReturnType<typeof setTimeout> | undefined;
  let fsPending = new Set<string>();

  function onFsChange(paths: string[]) {
    for (const p of paths) fsPending.add(norm(p));
    clearTimeout(fsTimer);
    fsTimer = setTimeout(async () => {
      const changed = fsPending;
      fsPending = new Set();
      if ($rootFolder) loadTree($rootFolder); // pick up adds/removes/renames
      if ($currentFile && changed.has(norm($currentFile))) {
        await openFile($currentFile); // re-render; scroll position is restored
      }
    }, 200);
  }

  async function chooseFolder() {
    if (!isTauri()) {
      flash($t("toast.desktopOnly"));
      return;
    }
    try {
      const path = await pickFolder();
      if (!path) return;
      rootFolder.set(path);
      currentFile.set(null);
      docOpen.set(false);
      docTitle.set("");
      renderedHtml.set("");
      toc.set([]);
      await loadTree(path);
    } catch (e) {
      errorMsg.set(String(e));
    }
  }

  async function openFile(path: string) {
    if (!isTauri()) return;
    loading.set(true);
    try {
      const src = await readFile(path);
      const { html, toc: t } = renderMarkdown(src);
      renderedHtml.set(html);
      toc.set(t);
      currentFile.set(path);
      docTitle.set(
        (path.split(/[\\/]/).pop() ?? "").replace(
          /\.(md|markdown|mdown|mkd)$/i,
          ""
        )
      );
      docOpen.set(true);
    } catch (e) {
      errorMsg.set(String(e));
    } finally {
      loading.set(false);
    }
  }

  function renderPasted(text: string, title: string) {
    try {
      const { html, toc: t } = renderMarkdown(text);
      renderedHtml.set(html);
      toc.set(t);
      currentFile.set(null); // virtual doc — not tied to a file
      docTitle.set(title);
      docOpen.set(true);
      pasteOpen = false;
    } catch (e) {
      errorMsg.set(String(e));
    }
  }

  function refresh() {
    if ($rootFolder) loadTree($rootFolder);
  }

  function navigate(id: string) {
    reader?.scrollToId(id);
  }

  function onKey(e: KeyboardEvent) {
    const mod = e.metaKey || e.ctrlKey;
    if (!mod) return;
    // Cmd/Ctrl+Shift+V — paste content sheet.
    if (e.shiftKey && e.key.toLowerCase() === "v") {
      e.preventDefault();
      pasteOpen = true;
      return;
    }
    if (e.shiftKey) return;
    switch (e.key.toLowerCase()) {
      case "o":
        e.preventDefault();
        chooseFolder();
        break;
      case "k":
        e.preventDefault();
        paletteOpen = true;
        break;
      case "f":
        if ($docOpen) {
          e.preventDefault();
          reader?.openFind();
        }
        break;
      case "b":
        e.preventDefault();
        settings.update((s) => ({ ...s, sidebarOpen: !s.sidebarOpen }));
        break;
      case "\\":
        e.preventDefault();
        settings.update((s) => ({ ...s, tocOpen: !s.tocOpen }));
        break;
      case "=":
      case "+":
        e.preventDefault();
        settings.update((s) => ({
          ...s,
          readSize: Math.min(1.5, s.readSize + 0.05),
        }));
        break;
      case "-":
        e.preventDefault();
        settings.update((s) => ({
          ...s,
          readSize: Math.max(0.85, s.readSize - 0.05),
        }));
        break;
      case "0":
        e.preventDefault();
        settings.update((s) => ({ ...s, readSize: 1.075 }));
        break;
    }
  }

  onMount(() => {
    if ($rootFolder) loadTree($rootFolder);
    let unlisten: UnlistenFn | undefined;
    if (isTauri()) {
      listen<string[]>("fs-change", (e) => onFsChange(e.payload)).then(
        (fn) => (unlisten = fn)
      );
    }
    return () => unlisten?.();
  });
</script>

<svelte:window on:keydown={onKey} />

<div class="app">
  <TitleBar onPaste={() => (pasteOpen = true)} />

  <div class="body">
    <div class="panel left" class:closed={!$settings.sidebarOpen}>
      <Sidebar
        onPickFolder={chooseFolder}
        onOpenFile={openFile}
        onRefresh={refresh}
      />
    </div>

    <main class="stage">
      {#if $docOpen}
        <Reader bind:this={reader} onOpenFile={openFile} />
      {:else}
        <Welcome onPickFolder={chooseFolder} onPaste={() => (pasteOpen = true)} />
      {/if}
    </main>

    <div
      class="panel right"
      class:closed={!$settings.tocOpen || $toc.length === 0}
    >
      <TableOfContents onNavigate={navigate} />
    </div>
  </div>

  {#if pasteOpen}
    <PasteModal onRender={renderPasted} onClose={() => (pasteOpen = false)} />
  {/if}

  {#if paletteOpen}
    <CommandPalette
      files={paletteFiles}
      commands={paletteCommands}
      onOpenFile={openFile}
      onClose={() => (paletteOpen = false)}
    />
  {/if}

  {#if toast}
    <div class="toast">{toast}</div>
  {/if}
</div>

<style>
  .app {
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  .body {
    flex: 1;
    display: flex;
    min-height: 0;
    overflow: hidden;
  }
  .stage {
    flex: 1;
    display: flex;
    min-width: 0;
    overflow: hidden;
  }

  .panel {
    overflow: hidden;
    flex-shrink: 0;
    transition: width var(--dur-3) var(--ease), opacity var(--dur-2) var(--ease);
  }
  .panel.left {
    width: var(--rail-w);
  }
  .panel.right {
    width: var(--toc-w);
  }
  .panel.closed {
    width: 0;
    opacity: 0;
    pointer-events: none;
  }

  .toast {
    position: fixed;
    left: 50%;
    bottom: 26px;
    transform: translateX(-50%);
    background: var(--ink);
    color: var(--paper);
    font-size: var(--text-sm);
    padding: 9px 16px;
    border-radius: var(--r-pill);
    box-shadow: var(--shadow-lg);
    z-index: 100;
    animation: toast-in var(--dur-2) var(--ease-out) both;
    max-width: 70vw;
  }
  @keyframes toast-in {
    from {
      opacity: 0;
      transform: translate(-50%, 8px);
    }
    to {
      opacity: 1;
      transform: translate(-50%, 0);
    }
  }
</style>
