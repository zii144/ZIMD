<script lang="ts">
  import {
    renderedHtml,
    settings,
    activeHeading,
    readingProgress,
  } from "../stores";
  import { renderMermaid } from "../markdown";

  let scrollEl: HTMLElement;
  let articleEl: HTMLElement;
  let headings: HTMLElement[] = [];

  function collectHeadings() {
    headings = articleEl
      ? Array.from(articleEl.querySelectorAll<HTMLElement>("h1, h2, h3"))
      : [];
  }

  function updateProgress() {
    if (!scrollEl) return;
    const max = scrollEl.scrollHeight - scrollEl.clientHeight;
    readingProgress.set(max > 0 ? Math.min(1, scrollEl.scrollTop / max) : 0);

    // Active heading = last heading above the reading line.
    const line = 140;
    let current: string | null = headings[0]?.id ?? null;
    for (const h of headings) {
      if (h.getBoundingClientRect().top - (scrollEl.getBoundingClientRect().top) <= line) {
        current = h.id;
      } else break;
    }
    activeHeading.set(current);
  }

  export function scrollToId(id: string) {
    const el = articleEl?.querySelector<HTMLElement>(`#${CSS.escape(id)}`);
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function onArticleClick(e: MouseEvent) {
    const a = (e.target as HTMLElement).closest("a");
    if (!a) return;
    const href = a.getAttribute("href") || "";
    if (href.startsWith("#")) {
      e.preventDefault();
      scrollToId(decodeURIComponent(href.slice(1)));
    }
  }

  // Re-render when the document changes.
  $effect(() => {
    // establish dependency
    void $renderedHtml;
    // wait for {@html} to flush
    queueMicrotask(async () => {
      if (!articleEl) return;
      collectHeadings();
      if (scrollEl) scrollEl.scrollTop = 0;
      readingProgress.set(0);
      updateProgress();
      await renderMermaid(articleEl, $settings.theme === "dark");
    });
  });
</script>

<div class="reader" bind:this={scrollEl} onscroll={updateProgress}>
  <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_noninteractive_element_interactions -->
  <article
    bind:this={articleEl}
    class="zimd-prose"
    data-font={$settings.font === "serif" ? "serif" : "sans"}
    style="--read-size:{$settings.readSize}rem; --read-measure:{$settings.measure}rem;"
    onclick={onArticleClick}
  >
    {@html $renderedHtml}
  </article>
</div>

<style>
  .reader {
    flex: 1;
    height: 100%;
    overflow-y: auto;
    scroll-behavior: smooth;
    background: var(--paper);
    position: relative;
  }
</style>
