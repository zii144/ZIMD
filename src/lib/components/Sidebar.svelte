<script lang="ts">
  import { fileTree, rootFolder } from "../stores";
  import type { FileNode } from "../types";
  import { t } from "../i18n";
  import FileTree from "./FileTree.svelte";
  import Icon from "./Icon.svelte";

  let {
    onPickFolder,
    onOpenFile,
    onRefresh,
  }: {
    onPickFolder: () => void;
    onOpenFile: (path: string) => void;
    onRefresh: () => void;
  } = $props();

  let query = $state("");

  const folderName = $derived(
    $rootFolder ? $rootFolder.split(/[\\/]/).filter(Boolean).pop() ?? "" : ""
  );

  function filterTree(nodes: FileNode[], q: string): FileNode[] {
    if (!q) return nodes;
    const needle = q.toLowerCase();
    const out: FileNode[] = [];
    for (const n of nodes) {
      if (n.is_dir && n.children) {
        const kids = filterTree(n.children, q);
        if (kids.length) out.push({ ...n, children: kids });
      } else if (!n.is_dir && n.name.toLowerCase().includes(needle)) {
        out.push(n);
      }
    }
    return out;
  }

  const visible = $derived(filterTree($fileTree, query));
</script>

<aside class="sidebar">
  <div class="rail-head" data-tauri-drag-region>
    <div class="folder-label" title={$rootFolder ?? ""}>
      {#if $rootFolder}
        <span class="ico"><Icon name="folder-open" size={16} /></span>
        <span class="fname">{folderName}</span>
      {:else}
        <span class="fname muted">{$t("side.noFolder")}</span>
      {/if}
    </div>
    <div class="rail-actions">
      {#if $rootFolder}
        <button class="ghost-btn" onclick={onRefresh} title={$t("side.refresh")}>
          <Icon name="refresh" size={15} />
        </button>
      {/if}
      <button class="ghost-btn" onclick={onPickFolder} title={$t("side.openFolder")}>
        <Icon name="folder" size={16} />
      </button>
    </div>
  </div>

  {#if $rootFolder}
    <div class="search">
      <span class="s-ico"><Icon name="search" size={14} /></span>
      <input
        type="text"
        placeholder={$t("side.filter")}
        bind:value={query}
        spellcheck="false"
      />
      {#if query}
        <button class="clear" onclick={() => (query = "")} title={$t("side.clear")}>
          <Icon name="close" size={13} />
        </button>
      {/if}
    </div>
  {/if}

  <div class="tree-scroll">
    {#if !$rootFolder}
      <button class="empty-cta" onclick={onPickFolder}>
        <span class="cta-ico"><Icon name="folder-open" size={22} /></span>
        <span class="cta-title">{$t("side.ctaTitle")}</span>
        <span class="cta-sub">{$t("side.ctaSub")}</span>
      </button>
    {:else if visible.length === 0}
      <p class="empty-note">
        {query ? $t("side.noMatch") : $t("side.empty")}
      </p>
    {:else}
      <FileTree nodes={visible} onOpen={onOpenFile} />
    {/if}
  </div>
</aside>

<style>
  .sidebar {
    width: var(--rail-w);
    height: 100%;
    background: var(--surface);
    border-right: 1px solid var(--line);
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
  }
  .rail-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding: 12px 8px 8px 14px;
    flex-shrink: 0;
  }
  .folder-label {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
    color: var(--ink);
  }
  .folder-label .ico {
    color: var(--ink-muted);
    display: inline-flex;
    flex-shrink: 0;
  }
  .fname {
    font-size: var(--text-sm);
    font-weight: 620;
    letter-spacing: -0.01em;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .fname.muted {
    color: var(--ink-muted);
    font-weight: 500;
  }
  .rail-actions {
    display: flex;
    gap: 2px;
    flex-shrink: 0;
  }
  .ghost-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: var(--r-sm);
    color: var(--ink-muted);
    transition: background var(--dur-1) var(--ease), color var(--dur-1) var(--ease);
  }
  .ghost-btn:hover {
    background: var(--surface-2);
    color: var(--ink);
  }

  .search {
    position: relative;
    margin: 4px 10px 6px;
    display: flex;
    align-items: center;
  }
  .search .s-ico {
    position: absolute;
    left: 9px;
    color: var(--ink-faint);
    display: inline-flex;
    pointer-events: none;
  }
  .search input {
    width: 100%;
    background: var(--paper);
    border: 1px solid var(--line);
    border-radius: var(--r-sm);
    padding: 6px 26px 6px 30px;
    font-size: var(--text-sm);
    color: var(--ink);
    outline: none;
    transition: border-color var(--dur-1) var(--ease), box-shadow var(--dur-1) var(--ease);
  }
  .search input::placeholder {
    color: var(--ink-faint);
  }
  .search input:focus {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px var(--accent-soft);
  }
  .search .clear {
    position: absolute;
    right: 6px;
    display: inline-flex;
    color: var(--ink-faint);
    padding: 3px;
    border-radius: var(--r-xs);
  }
  .search .clear:hover {
    color: var(--ink);
    background: var(--surface-2);
  }

  .tree-scroll {
    flex: 1;
    overflow-y: auto;
    padding: 4px 8px 16px;
  }

  .empty-cta {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 3px;
    width: 100%;
    margin-top: 18px;
    padding: 22px 16px;
    border: 1px dashed var(--line-strong);
    border-radius: var(--r-md);
    color: var(--ink-muted);
    transition: border-color var(--dur-2) var(--ease), color var(--dur-2) var(--ease), background var(--dur-2) var(--ease);
  }
  .empty-cta:hover {
    border-color: var(--accent);
    color: var(--accent-ink);
    background: var(--accent-soft);
  }
  .cta-ico {
    display: inline-flex;
    margin-bottom: 4px;
  }
  .cta-title {
    font-size: var(--text-sm);
    font-weight: 620;
    color: var(--ink);
  }
  .cta-sub {
    font-size: var(--text-xs);
  }
  .empty-note {
    padding: 18px 12px;
    font-size: var(--text-sm);
    color: var(--ink-muted);
    text-align: center;
  }
</style>
