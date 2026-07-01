<script lang="ts">
  import { settings, docOpen, docTitle, readingProgress } from "../stores";
  import { isMac } from "../platform";
  import Icon from "./Icon.svelte";
  import WindowControls from "./WindowControls.svelte";

  let { onPaste }: { onPaste: () => void } = $props();

  const MIN = 0.85;
  const MAX = 1.5;

  function toggleSidebar() {
    settings.update((s) => ({ ...s, sidebarOpen: !s.sidebarOpen }));
  }
  function toggleToc() {
    settings.update((s) => ({ ...s, tocOpen: !s.tocOpen }));
  }
  function toggleTheme() {
    settings.update((s) => ({
      ...s,
      theme: s.theme === "dark" ? "light" : "dark",
    }));
  }
  function toggleFont() {
    settings.update((s) => ({
      ...s,
      font: s.font === "serif" ? "sans" : "serif",
    }));
  }
  function bump(delta: number) {
    settings.update((s) => ({
      ...s,
      readSize: Math.round(
        Math.min(MAX, Math.max(MIN, s.readSize + delta)) * 1000
      ) / 1000,
    }));
  }
</script>

<header class="titlebar" data-tauri-drag-region class:mac={isMac}>
  <div class="lead" data-tauri-drag-region>
    <span class="brand">ZIMD</span>
  </div>

  <div class="center" data-tauri-drag-region>
    {#if $docTitle}
      <span class="doc-title">{$docTitle}</span>
    {/if}
  </div>

  <div class="controls">
    <div class="group">
      <button class="tb-btn" onclick={onPaste} title="Paste content (⇧⌘V)">
        <Icon name="paste" size={17} />
      </button>
    </div>

    <span class="divider"></span>

    <div class="group">
      <button class="tb-btn" onclick={() => bump(-0.05)} title="Smaller text">
        <Icon name="minus" size={15} />
      </button>
      <button class="tb-btn" onclick={() => bump(0.05)} title="Larger text">
        <Icon name="plus" size={15} />
      </button>
      <button
        class="tb-btn"
        class:on={$settings.font === "serif"}
        onclick={toggleFont}
        title={$settings.font === "serif" ? "Serif — click for sans" : "Sans — click for serif"}
      >
        <Icon name="serif" size={17} />
      </button>
    </div>

    <span class="divider"></span>

    <div class="group">
      <button
        class="tb-btn"
        onclick={toggleTheme}
        title={$settings.theme === "dark" ? "Switch to light" : "Switch to dark"}
      >
        <Icon name={$settings.theme === "dark" ? "sun" : "moon"} size={17} />
      </button>
      <button
        class="tb-btn"
        class:on={$settings.sidebarOpen}
        onclick={toggleSidebar}
        title="Toggle sidebar"
      >
        <Icon name="sidebar" size={17} />
      </button>
      <button
        class="tb-btn"
        class:on={$settings.tocOpen}
        onclick={toggleToc}
        title="Toggle contents"
      >
        <Icon name="toc" size={17} />
      </button>
    </div>

    {#if !isMac}
      <span class="divider"></span>
      <WindowControls />
    {/if}
  </div>

  <div
    class="progress"
    style="transform: scaleX({$docOpen ? $readingProgress : 0})"
  ></div>
</header>

<style>
  .titlebar {
    height: var(--titlebar-h);
    flex-shrink: 0;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 0 10px 0 14px;
    background: color-mix(in srgb, var(--paper) 82%, transparent);
    backdrop-filter: saturate(1.4) blur(14px);
    -webkit-backdrop-filter: saturate(1.4) blur(14px);
    border-bottom: 1px solid var(--line);
    position: relative;
    z-index: 10;
  }
  .titlebar.mac {
    padding-left: 78px; /* clear the traffic lights */
  }
  .lead {
    display: flex;
    align-items: center;
    flex-shrink: 0;
  }
  .brand {
    font-size: var(--text-sm);
    font-weight: 720;
    letter-spacing: 0.16em;
    padding-left: 0.16em;
    color: var(--ink);
  }
  .center {
    flex: 1;
    display: flex;
    justify-content: center;
    min-width: 0;
    height: 100%;
    align-items: center;
  }
  .doc-title {
    font-size: var(--text-sm);
    font-weight: 560;
    color: var(--ink-soft);
    letter-spacing: -0.005em;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 46ch;
  }
  .controls {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-shrink: 0;
  }
  .group {
    display: flex;
    align-items: center;
    gap: 1px;
  }
  .tb-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    border-radius: var(--r-sm);
    color: var(--ink-muted);
    transition: background var(--dur-1) var(--ease), color var(--dur-1) var(--ease);
  }
  .tb-btn:hover {
    background: var(--surface-2);
    color: var(--ink);
  }
  .tb-btn.on {
    color: var(--accent-ink);
    background: var(--accent-soft);
  }
  .divider {
    width: 1px;
    height: 18px;
    background: var(--line-strong);
    margin: 0 2px;
  }
  .progress {
    position: absolute;
    left: 0;
    bottom: -1px;
    height: 2px;
    width: 100%;
    background: var(--accent);
    transform-origin: left center;
    transform: scaleX(0);
    transition: transform 90ms linear;
    opacity: 0.9;
  }
</style>
