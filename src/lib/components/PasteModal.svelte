<script lang="ts">
  import Icon from "./Icon.svelte";

  let {
    onRender,
    onClose,
  }: {
    onRender: (text: string, title: string) => void;
    onClose: () => void;
  } = $props();

  let text = $state("");
  let title = $state("");
  let area = $state<HTMLTextAreaElement>();

  const isMac =
    typeof navigator !== "undefined" &&
    navigator.platform.toLowerCase().includes("mac");
  const mod = isMac ? "⌘" : "Ctrl";

  const chars = $derived(text.length);

  function submit() {
    const body = text.trim();
    if (!body) return;
    onRender(body, title.trim() || "Pasted");
  }

  function onKey(e: KeyboardEvent) {
    if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    } else if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      submit();
    }
  }

  $effect(() => {
    area?.focus();
  });
</script>

<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
<div class="backdrop" role="presentation" onclick={onClose}>
  <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
  <div
    class="sheet"
    role="dialog"
    aria-modal="true"
    aria-label="Paste Markdown"
    tabindex="-1"
    onclick={(e) => e.stopPropagation()}
    onkeydown={onKey}
  >
    <header class="sheet-head">
      <span class="s-ico"><Icon name="paste" size={17} /></span>
      <input
        class="title-in"
        placeholder="Untitled"
        bind:value={title}
        spellcheck="false"
      />
      <button class="x" onclick={onClose} title="Close">
        <Icon name="close" size={16} />
      </button>
    </header>

    <textarea
      bind:this={area}
      bind:value={text}
      class="paste-area"
      placeholder="Paste or type Markdown here…"
      spellcheck="false"
    ></textarea>

    <footer class="sheet-foot">
      <span class="count">{chars.toLocaleString()} characters</span>
      <div class="actions">
        <button class="btn ghost" onclick={onClose}>Cancel</button>
        <button class="btn primary" onclick={submit} disabled={!text.trim()}>
          Render
          <span class="kbd-hint">{mod}↵</span>
        </button>
      </div>
    </footer>
  </div>
</div>

<style>
  .backdrop {
    position: fixed;
    inset: 0;
    z-index: 200;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 40px;
    background: color-mix(in srgb, var(--ink) 22%, transparent);
    backdrop-filter: blur(3px);
    -webkit-backdrop-filter: blur(3px);
    animation: fade var(--dur-2) var(--ease) both;
  }
  .sheet {
    width: min(760px, 100%);
    height: min(560px, 82vh);
    display: flex;
    flex-direction: column;
    background: var(--paper);
    border: 1px solid var(--line);
    border-radius: var(--r-lg);
    box-shadow: var(--shadow-lg);
    overflow: hidden;
    animation: pop var(--dur-3) var(--ease-out) both;
  }
  .sheet-head {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 12px 12px 16px;
    border-bottom: 1px solid var(--line);
  }
  .s-ico {
    color: var(--ink-muted);
    display: inline-flex;
    flex-shrink: 0;
  }
  .title-in {
    flex: 1;
    background: none;
    border: none;
    outline: none;
    font-size: var(--text-base);
    font-weight: 620;
    color: var(--ink);
    letter-spacing: -0.01em;
  }
  .title-in::placeholder {
    color: var(--ink-faint);
    font-weight: 500;
  }
  .x {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    border-radius: var(--r-sm);
    color: var(--ink-muted);
    transition: background var(--dur-1) var(--ease), color var(--dur-1) var(--ease);
  }
  .x:hover {
    background: var(--surface-2);
    color: var(--ink);
  }
  .paste-area {
    flex: 1;
    resize: none;
    border: none;
    outline: none;
    background: var(--paper);
    color: var(--ink);
    font-family: var(--font-mono);
    font-size: 0.86rem;
    line-height: 1.7;
    padding: 18px 20px;
    tab-size: 2;
  }
  .paste-area::placeholder {
    color: var(--ink-faint);
  }
  .sheet-foot {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    border-top: 1px solid var(--line);
    background: var(--surface);
  }
  .count {
    font-size: var(--text-xs);
    color: var(--ink-muted);
    font-variant-numeric: tabular-nums;
  }
  .actions {
    display: flex;
    gap: 8px;
  }
  .btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    border-radius: var(--r-pill);
    font-size: var(--text-sm);
    font-weight: 560;
    transition: background var(--dur-1) var(--ease), transform var(--dur-1) var(--ease), opacity var(--dur-1) var(--ease);
  }
  .btn.ghost {
    color: var(--ink-soft);
  }
  .btn.ghost:hover {
    background: var(--surface-2);
    color: var(--ink);
  }
  .btn.primary {
    background: var(--ink);
    color: var(--paper);
    box-shadow: var(--shadow-sm);
  }
  .btn.primary:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: var(--shadow-md);
  }
  .btn.primary:disabled {
    opacity: 0.4;
    cursor: default;
  }
  .kbd-hint {
    font-size: 11px;
    opacity: 0.65;
    padding-left: 2px;
    letter-spacing: 0.02em;
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
      transform: translateY(10px) scale(0.985);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
</style>
