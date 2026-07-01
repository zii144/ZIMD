<script lang="ts">
  import type { FileNode } from "../types";
  import { currentFile } from "../stores";
  import Icon from "./Icon.svelte";
  import Self from "./FileTree.svelte";

  let {
    nodes,
    depth = 0,
    onOpen,
  }: {
    nodes: FileNode[];
    depth?: number;
    onOpen: (path: string) => void;
  } = $props();

  // Track expanded folders locally (top two levels open by default).
  let expanded = $state<Record<string, boolean>>({});

  function isOpen(node: FileNode): boolean {
    return expanded[node.path] ?? depth < 1;
  }
  function toggle(node: FileNode) {
    expanded[node.path] = !isOpen(node);
  }

  function label(name: string): string {
    return name.replace(/\.(md|markdown|mdown|mkd)$/i, "");
  }
</script>

<ul class="tree" style="--depth:{depth}">
  {#each nodes as node (node.path)}
    <li>
      {#if node.is_dir}
        <button
          class="row folder"
          onclick={() => toggle(node)}
          title={node.name}
        >
          <span class="chev" class:open={isOpen(node)}>
            <Icon name="chevron" size={14} />
          </span>
          <span class="ico"><Icon name={isOpen(node) ? "folder-open" : "folder"} size={16} /></span>
          <span class="name">{node.name}</span>
        </button>
        {#if isOpen(node) && node.children}
          <Self nodes={node.children} depth={depth + 1} {onOpen} />
        {/if}
      {:else}
        <button
          class="row file"
          class:active={$currentFile === node.path}
          onclick={() => onOpen(node.path)}
          title={node.name}
        >
          <span class="ico file-ico"><Icon name="file" size={15} /></span>
          <span class="name">{label(node.name)}</span>
        </button>
      {/if}
    </li>
  {/each}
</ul>

<style>
  .tree {
    list-style: none;
    margin: 0;
    padding: 0;
  }
  .row {
    display: flex;
    align-items: center;
    gap: 6px;
    width: 100%;
    text-align: left;
    padding: 5px 10px 5px calc(10px + var(--depth) * 15px);
    border-radius: var(--r-sm);
    color: var(--ink-soft);
    font-size: var(--text-sm);
    line-height: 1.35;
    position: relative;
    transition: background var(--dur-1) var(--ease), color var(--dur-1) var(--ease);
  }
  .row:hover {
    background: var(--surface-2);
    color: var(--ink);
  }
  .name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    flex: 1;
  }
  .chev {
    display: inline-flex;
    color: var(--ink-faint);
    transition: transform var(--dur-2) var(--ease);
    flex-shrink: 0;
  }
  .chev.open {
    transform: rotate(90deg);
  }
  .ico {
    display: inline-flex;
    color: var(--ink-muted);
    flex-shrink: 0;
  }
  .folder .name {
    font-weight: 550;
    color: var(--ink);
  }
  .file {
    padding-left: calc(10px + var(--depth) * 15px + 20px);
  }
  .file-ico {
    color: var(--ink-faint);
  }
  .file.active {
    background: var(--accent-soft);
    color: var(--accent-ink);
  }
  .file.active .file-ico {
    color: var(--accent);
  }
  .file.active .name {
    font-weight: 560;
  }
  .file.active::before {
    content: "";
    position: absolute;
    left: 0;
    top: 6px;
    bottom: 6px;
    width: 2.5px;
    border-radius: var(--r-pill);
    background: var(--accent);
  }
</style>
