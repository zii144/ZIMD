<script lang="ts">
  import { rootFolder } from "../stores";
  import Icon from "./Icon.svelte";

  let {
    onPickFolder,
    onPaste,
  }: { onPickFolder: () => void; onPaste: () => void } = $props();

  const mod = navigator.platform.toLowerCase().includes("mac") ? "⌘" : "Ctrl";
</script>

<div class="welcome">
  <div class="mark">
    <span class="glyph">Z</span>
  </div>
  <h1 class="wordmark">ZIMD</h1>
  <p class="tag">A calm place to read Markdown.</p>

  <div class="cta-row">
    <button class="open-btn" onclick={onPickFolder}>
      <Icon name="folder-open" size={17} />
      <span>{$rootFolder ? "Choose a document" : "Open a folder"}</span>
    </button>
    <button class="paste-btn" onclick={onPaste}>
      <Icon name="paste" size={16} />
      <span>Paste content</span>
    </button>
  </div>

  <div class="hints">
    <div class="hint"><kbd>{mod}</kbd><kbd>O</kbd><span>Open folder</span></div>
    <div class="hint"><kbd>⇧</kbd><kbd>{mod}</kbd><kbd>V</kbd><span>Paste content</span></div>
    <div class="hint"><kbd>{mod}</kbd><kbd>\</kbd><span>Toggle contents</span></div>
  </div>

  <p class="sig">Designed &amp; developed by Zii</p>
</div>

<style>
  .welcome {
    flex: 1;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: var(--paper);
    padding: 40px;
    text-align: center;
    user-select: none;
  }
  .mark {
    width: 76px;
    height: 76px;
    border-radius: 20px;
    background: var(--surface);
    border: 1px solid var(--line);
    box-shadow: var(--shadow-md);
    display: grid;
    place-items: center;
    margin-bottom: 22px;
    animation: rise var(--dur-3) var(--ease-out) both;
  }
  .glyph {
    font-family: var(--font-serif);
    font-size: 42px;
    font-weight: 600;
    color: var(--accent);
    line-height: 1;
    transform: translateY(-1px);
  }
  .wordmark {
    font-family: var(--font-ui);
    font-size: 1.55rem;
    font-weight: 680;
    letter-spacing: 0.18em;
    padding-left: 0.18em;
    color: var(--ink);
    animation: rise var(--dur-3) 40ms var(--ease-out) both;
  }
  .tag {
    margin-top: 8px;
    color: var(--ink-muted);
    font-size: var(--text-base);
    animation: rise var(--dur-3) 80ms var(--ease-out) both;
  }
  .cta-row {
    margin-top: 30px;
    display: flex;
    align-items: center;
    gap: 10px;
    animation: rise var(--dur-3) 120ms var(--ease-out) both;
  }
  .open-btn,
  .paste-btn {
    display: inline-flex;
    align-items: center;
    gap: 9px;
    padding: 10px 20px;
    border-radius: var(--r-pill);
    font-size: var(--text-sm);
    font-weight: 560;
    transition: transform var(--dur-2) var(--ease-out), box-shadow var(--dur-2) var(--ease), background var(--dur-1) var(--ease), opacity var(--dur-1) var(--ease);
  }
  .open-btn {
    background: var(--ink);
    color: var(--paper);
    box-shadow: var(--shadow-md);
  }
  .open-btn:hover {
    transform: translateY(-1px);
    box-shadow: var(--shadow-lg);
  }
  .open-btn:active {
    transform: translateY(0);
    opacity: 0.9;
  }
  .paste-btn {
    background: var(--surface);
    color: var(--ink-soft);
    border: 1px solid var(--line);
  }
  .paste-btn:hover {
    background: var(--surface-2);
    color: var(--ink);
    transform: translateY(-1px);
  }
  .paste-btn:active {
    transform: translateY(0);
  }
  .hints {
    margin-top: 34px;
    display: flex;
    gap: 22px;
    flex-wrap: wrap;
    justify-content: center;
    animation: rise var(--dur-3) 160ms var(--ease-out) both;
  }
  .hint {
    display: flex;
    align-items: center;
    gap: 6px;
    color: var(--ink-muted);
    font-size: var(--text-xs);
  }
  .hint span {
    margin-left: 3px;
  }
  kbd {
    font-family: var(--font-ui);
    font-size: 11px;
    min-width: 20px;
    height: 20px;
    padding: 0 5px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: var(--surface);
    border: 1px solid var(--line-strong);
    border-bottom-width: 2px;
    border-radius: 6px;
    color: var(--ink-soft);
  }
  .sig {
    position: absolute;
    bottom: 26px;
    font-size: var(--text-xs);
    color: var(--ink-faint);
    letter-spacing: 0.03em;
  }
  @keyframes rise {
    from {
      opacity: 0;
      transform: translateY(8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>
