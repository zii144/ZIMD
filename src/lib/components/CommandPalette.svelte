<script lang="ts">
  import Icon from "./Icon.svelte";
  import { t } from "../i18n";
  import type { PaletteCommand, PaletteFile } from "../types";

  let {
    files,
    commands,
    onOpenFile,
    onClose,
  }: {
    files: PaletteFile[];
    commands: PaletteCommand[];
    onOpenFile: (path: string) => void;
    onClose: () => void;
  } = $props();

  interface Item {
    kind: "command" | "file";
    title: string;
    hint?: string;
    icon: string;
    action: () => void;
  }

  let query = $state("");
  let selected = $state(0);
  let input = $state<HTMLInputElement>();
  let listEl = $state<HTMLElement>();

  function score(q: string, text: string): number {
    if (!q) return 0;
    const t = text.toLowerCase();
    const s = q.toLowerCase();
    let bonus = 0;
    if (t.includes(s)) bonus += t.startsWith(s) ? 40 : 20;
    let ti = 0,
      qi = 0,
      run = 0,
      sc = 0;
    for (; ti < t.length && qi < s.length; ti++) {
      if (t[ti] === s[qi]) {
        qi++;
        run++;
        sc += run + (ti === 0 ? 5 : 0);
      } else run = 0;
    }
    return qi === s.length ? sc + bonus : -1;
  }

  const results = $derived.by<Item[]>(() => {
    const q = query.trim();
    const cmdItems: Item[] = commands
      .map((c) => ({ c, s: score(q, c.title) }))
      .filter((x) => x.s >= 0)
      .sort((a, b) => b.s - a.s)
      .map(({ c }) => ({
        kind: "command" as const,
        title: c.title,
        hint: c.hint,
        icon: c.icon,
        action: c.run,
      }));

    const fileItems: Item[] = files
      .map((f) => ({ f, s: Math.max(score(q, f.name), score(q, f.path) - 5) }))
      .filter((x) => x.s >= 0)
      .sort((a, b) => b.s - a.s)
      .slice(0, q ? 40 : 8)
      .map(({ f }) => ({
        kind: "file" as const,
        title: f.name.replace(/\.(md|markdown|mdown|mkd)$/i, ""),
        hint: f.path,
        icon: "file",
        action: () => onOpenFile(f.path),
      }));

    // Commands first when searching or idle; files fill the rest.
    return [...cmdItems, ...fileItems];
  });

  function activate(i: number) {
    const item = results[i];
    if (!item) return;
    onClose();
    item.action();
  }

  function onKey(e: KeyboardEvent) {
    if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      selected = Math.min(results.length - 1, selected + 1);
      scrollSelected();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      selected = Math.max(0, selected - 1);
      scrollSelected();
    } else if (e.key === "Enter") {
      e.preventDefault();
      activate(selected);
    }
  }

  function scrollSelected() {
    queueMicrotask(() => {
      listEl
        ?.querySelector(`[data-i="${selected}"]`)
        ?.scrollIntoView({ block: "nearest" });
    });
  }

  // Keep the selection valid as results change.
  $effect(() => {
    void results;
    if (selected > results.length - 1) selected = 0;
  });

  $effect(() => {
    input?.focus();
  });
</script>

<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
<div class="backdrop" role="presentation" onclick={onClose}>
  <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
  <div
    class="palette"
    role="dialog"
    aria-modal="true"
    tabindex="-1"
    onclick={(e) => e.stopPropagation()}
  >
    <div class="p-head">
      <span class="p-ico"><Icon name="search" size={17} /></span>
      <input
        bind:this={input}
        bind:value={query}
        onkeydown={onKey}
        placeholder={$t("palette.placeholder")}
        spellcheck="false"
      />
    </div>

    <div class="p-list" bind:this={listEl} role="listbox" tabindex="-1">
      {#if results.length === 0}
        <div class="p-empty">{$t("palette.noMatches")}</div>
      {:else}
        {#each results as item, i (item.kind + item.title + (item.hint ?? ""))}
          <!-- svelte-ignore a11y_click_events_have_key_events -->
          <div
            class="p-item"
            class:sel={i === selected}
            data-i={i}
            role="option"
            tabindex="-1"
            aria-selected={i === selected}
            onmousemove={() => (selected = i)}
            onclick={() => activate(i)}
          >
            <span class="i-ico" class:cmd={item.kind === "command"}>
              <Icon name={item.icon} size={16} />
            </span>
            <span class="i-title">{item.title}</span>
            {#if item.hint && item.kind === "file"}
              <span class="i-hint">{item.hint}</span>
            {:else if item.hint}
              <span class="i-kbd">{item.hint}</span>
            {/if}
          </div>
        {/each}
      {/if}
    </div>
  </div>
</div>

<style>
  .backdrop {
    position: fixed;
    inset: 0;
    z-index: 200;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    padding: 12vh 40px 40px;
    background: color-mix(in srgb, var(--ink) 20%, transparent);
    backdrop-filter: blur(3px);
    -webkit-backdrop-filter: blur(3px);
    animation: fade var(--dur-2) var(--ease) both;
  }
  .palette {
    width: min(620px, 100%);
    max-height: 60vh;
    display: flex;
    flex-direction: column;
    background: var(--paper);
    border: 1px solid var(--line);
    border-radius: var(--r-lg);
    box-shadow: var(--shadow-lg);
    overflow: hidden;
    animation: pop var(--dur-3) var(--ease-out) both;
  }
  .p-head {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 14px 16px;
    border-bottom: 1px solid var(--line);
  }
  .p-ico {
    color: var(--ink-muted);
    display: inline-flex;
  }
  .p-head input {
    flex: 1;
    border: none;
    outline: none;
    background: none;
    color: var(--ink);
    font-size: var(--text-base);
  }
  .p-head input::placeholder {
    color: var(--ink-faint);
  }
  .p-list {
    overflow-y: auto;
    padding: 6px;
  }
  .p-empty {
    padding: 22px;
    text-align: center;
    color: var(--ink-muted);
    font-size: var(--text-sm);
  }
  .p-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 10px;
    border-radius: var(--r-sm);
    cursor: pointer;
    color: var(--ink-soft);
  }
  .p-item.sel {
    background: var(--accent-soft);
    color: var(--ink);
  }
  .i-ico {
    display: inline-flex;
    color: var(--ink-muted);
    flex-shrink: 0;
  }
  .i-ico.cmd {
    color: var(--accent);
  }
  .i-title {
    font-size: var(--text-sm);
    font-weight: 550;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    flex-shrink: 0;
    max-width: 55%;
  }
  .i-hint {
    margin-left: auto;
    font-size: var(--text-xs);
    color: var(--ink-faint);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    direction: rtl;
    text-align: right;
  }
  .i-kbd {
    margin-left: auto;
    font-size: var(--text-xs);
    color: var(--ink-muted);
  }
  @keyframes fade {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
  @keyframes pop {
    from {
      opacity: 0;
      transform: translateY(-8px) scale(0.99);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
</style>
