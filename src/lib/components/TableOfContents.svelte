<script lang="ts">
  import { toc, activeHeading } from "../stores";

  let { onNavigate }: { onNavigate: (id: string) => void } = $props();

  const minLevel = $derived(
    $toc.length ? Math.min(...$toc.map((t) => t.level)) : 1
  );
</script>

{#if $toc.length > 0}
  <nav class="toc">
    <div class="toc-title">Contents</div>
    <ul>
      {#each $toc as item (item.id)}
        <li>
          <button
            class="toc-link"
            class:active={$activeHeading === item.id}
            style="--indent:{item.level - minLevel}"
            onclick={() => onNavigate(item.id)}
            title={item.text}
          >
            <span class="tick"></span>
            <span class="txt">{item.text}</span>
          </button>
        </li>
      {/each}
    </ul>
  </nav>
{/if}

<style>
  .toc {
    width: var(--toc-w);
    flex-shrink: 0;
    height: 100%;
    overflow-y: auto;
    padding: 26px 20px 40px 8px;
    border-left: 1px solid var(--line);
  }
  .toc-title {
    font-size: var(--text-xs);
    text-transform: uppercase;
    letter-spacing: 0.09em;
    font-weight: 650;
    color: var(--ink-faint);
    padding: 0 8px 10px;
  }
  ul {
    list-style: none;
  }
  .toc-link {
    display: flex;
    align-items: baseline;
    gap: 8px;
    width: 100%;
    text-align: left;
    padding: 4px 8px 4px calc(8px + var(--indent) * 12px);
    border-radius: var(--r-sm);
    color: var(--ink-muted);
    font-size: var(--text-sm);
    line-height: 1.4;
    transition: color var(--dur-1) var(--ease), background var(--dur-1) var(--ease);
  }
  .toc-link:hover {
    color: var(--ink);
    background: var(--surface);
  }
  .tick {
    width: 2px;
    align-self: stretch;
    border-radius: var(--r-pill);
    background: transparent;
    flex-shrink: 0;
    transition: background var(--dur-2) var(--ease);
    margin: 2px 0;
  }
  .txt {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .toc-link.active {
    color: var(--accent-ink);
    font-weight: 560;
  }
  .toc-link.active .tick {
    background: var(--accent);
  }
</style>
