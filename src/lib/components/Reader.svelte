<script lang="ts">
  import { convertFileSrc } from "@tauri-apps/api/core";
  import {
    renderedHtml,
    settings,
    activeHeading,
    readingProgress,
    currentFile,
    docStats,
  } from "../stores";
  import { renderMermaid } from "../markdown";
  import { isTauri } from "../fs";
  import { dirName, isExternalUrl, resolvePath } from "../paths";
  import { getScroll, saveScroll } from "../scroll";
  import Icon from "./Icon.svelte";

  let { onOpenFile }: { onOpenFile: (path: string) => void } = $props();

  let scrollEl: HTMLElement;
  let articleEl: HTMLElement;
  let headings: HTMLElement[] = [];

  // ---- Find state ----
  let findOpen = $state(false);
  let findQuery = $state("");
  let findCount = $state(0);
  let findIndex = $state(0);
  let findInput = $state<HTMLInputElement>();
  let findMatches: HTMLElement[] = [];
  let findTimer: ReturnType<typeof setTimeout> | undefined;

  function collectHeadings() {
    headings = articleEl
      ? Array.from(articleEl.querySelectorAll<HTMLElement>("h1, h2, h3"))
      : [];
  }

  function updateProgress() {
    if (!scrollEl) return;
    const max = scrollEl.scrollHeight - scrollEl.clientHeight;
    readingProgress.set(max > 0 ? Math.min(1, scrollEl.scrollTop / max) : 0);

    const line = 140;
    const top = scrollEl.getBoundingClientRect().top;
    let current: string | null = headings[0]?.id ?? null;
    for (const h of headings) {
      if (h.getBoundingClientRect().top - top <= line) current = h.id;
      else break;
    }
    activeHeading.set(current);

    if ($currentFile) saveScroll($currentFile, scrollEl.scrollTop);
  }

  export function scrollToId(id: string) {
    const el = articleEl?.querySelector<HTMLElement>(`#${CSS.escape(id)}`);
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  export function openFind() {
    findOpen = true;
    queueMicrotask(() => {
      findInput?.focus();
      findInput?.select();
    });
  }

  function onArticleClick(e: MouseEvent) {
    const a = (e.target as HTMLElement).closest("a");
    if (!a) return;
    const href = a.getAttribute("href") || "";
    if (!href) return;

    if (href.startsWith("#")) {
      e.preventDefault();
      scrollToId(decodeURIComponent(href.slice(1)));
      return;
    }
    // External links: don't navigate the webview away from the app.
    if (isExternalUrl(href)) {
      e.preventDefault();
      return;
    }
    // Relative/local link — open it in the reader.
    e.preventDefault();
    if (!isTauri() || !$currentFile) return;
    const [pathPart] = href.split("#");
    if (!pathPart) return;
    const abs = resolvePath(dirName($currentFile), pathPart);
    onOpenFile(abs);
  }

  // ---- Rewrite relative images to the asset protocol ----
  function rewriteImages() {
    if (!articleEl || !isTauri() || !$currentFile) return;
    const base = dirName($currentFile);
    articleEl.querySelectorAll("img").forEach((img) => {
      const raw = img.getAttribute("src") || "";
      if (!raw || isExternalUrl(raw)) return;
      try {
        img.src = convertFileSrc(resolvePath(base, raw));
      } catch {
        /* leave as-is */
      }
    });
  }

  // ---- Copy affordance on code blocks ----
  function injectCopyButtons() {
    if (!articleEl) return;
    articleEl.querySelectorAll("pre").forEach((pre) => {
      const code = pre.querySelector("code");
      if (!code || pre.querySelector(".code-copy")) return;
      pre.classList.add("has-copy");
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "code-copy";
      btn.textContent = "Copy";
      btn.addEventListener("click", async () => {
        try {
          await navigator.clipboard.writeText(code.innerText);
          btn.textContent = "Copied";
          btn.classList.add("done");
          setTimeout(() => {
            btn.textContent = "Copy";
            btn.classList.remove("done");
          }, 1200);
        } catch {
          /* ignore */
        }
      });
      pre.appendChild(btn);
    });
  }

  function computeStats() {
    const text = articleEl?.textContent ?? "";
    const words = (text.match(/\S+/g) || []).length;
    docStats.set(
      words ? { words, minutes: Math.max(1, Math.round(words / 220)) } : null
    );
  }

  // ---- Find highlighting ----
  function clearFind() {
    if (!articleEl) return;
    articleEl.querySelectorAll("mark.find-hit").forEach((m) => {
      const parent = m.parentNode;
      if (!parent) return;
      parent.replaceChild(document.createTextNode(m.textContent || ""), m);
      parent.normalize();
    });
    findMatches = [];
    findCount = 0;
    findIndex = 0;
  }

  function runFind(query: string) {
    clearFind();
    const q = query.trim();
    if (!q || !articleEl) return;
    const needle = q.toLowerCase();

    const walker = document.createTreeWalker(
      articleEl,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode(node) {
          if (!node.nodeValue || !node.nodeValue.trim())
            return NodeFilter.FILTER_REJECT;
          const p = (node as Text).parentElement;
          if (!p || p.closest("script,style,.mermaid,.code-copy"))
            return NodeFilter.FILTER_REJECT;
          return NodeFilter.FILTER_ACCEPT;
        },
      }
    );

    const textNodes: Text[] = [];
    let node: Node | null;
    while ((node = walker.nextNode())) textNodes.push(node as Text);

    for (const tn of textNodes) {
      const text = tn.nodeValue ?? "";
      const hay = text.toLowerCase();
      let idx = hay.indexOf(needle);
      if (idx === -1) continue;
      const frag = document.createDocumentFragment();
      let last = 0;
      while (idx !== -1) {
        if (idx > last)
          frag.appendChild(document.createTextNode(text.slice(last, idx)));
        const mark = document.createElement("mark");
        mark.className = "find-hit";
        mark.textContent = text.slice(idx, idx + q.length);
        frag.appendChild(mark);
        last = idx + q.length;
        idx = hay.indexOf(needle, last);
      }
      if (last < text.length)
        frag.appendChild(document.createTextNode(text.slice(last)));
      tn.parentNode?.replaceChild(frag, tn);
    }

    findMatches = Array.from(
      articleEl.querySelectorAll<HTMLElement>("mark.find-hit")
    );
    findCount = findMatches.length;
    findIndex = 0;
    if (findCount) gotoMatch(0);
  }

  function gotoMatch(i: number) {
    if (!findMatches.length) return;
    findMatches.forEach((m) => m.classList.remove("find-hit--active"));
    findIndex = (i + findMatches.length) % findMatches.length;
    const el = findMatches[findIndex];
    el.classList.add("find-hit--active");
    el.scrollIntoView({ block: "center", behavior: "smooth" });
  }

  function nextMatch() {
    gotoMatch(findIndex + 1);
  }
  function prevMatch() {
    gotoMatch(findIndex - 1);
  }

  function onFindInput() {
    clearTimeout(findTimer);
    const q = findQuery;
    findTimer = setTimeout(() => runFind(q), 120);
  }

  function onFindKey(e: KeyboardEvent) {
    if (e.key === "Escape") {
      e.preventDefault();
      closeFind();
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (e.shiftKey) prevMatch();
      else nextMatch();
    }
  }

  function closeFind() {
    findOpen = false;
    findQuery = "";
    clearFind();
  }

  // Re-process whenever the document changes.
  $effect(() => {
    void $renderedHtml;
    queueMicrotask(async () => {
      if (!articleEl) return;
      if (findOpen) closeFind();
      collectHeadings();
      rewriteImages();
      injectCopyButtons();
      computeStats();
      await renderMermaid(articleEl, $settings.theme === "dark");
      requestAnimationFrame(() => {
        if (!scrollEl) return;
        scrollEl.scrollTop = $currentFile ? getScroll($currentFile) : 0;
        updateProgress();
      });
    });
  });
</script>

<div class="reader" bind:this={scrollEl} onscroll={updateProgress}>
  {#if findOpen}
    <div class="findbar">
      <input
        bind:this={findInput}
        bind:value={findQuery}
        oninput={onFindInput}
        onkeydown={onFindKey}
        placeholder="Find in document"
        spellcheck="false"
      />
      <span class="fcount">
        {findCount ? `${findIndex + 1} / ${findCount}` : "0 / 0"}
      </span>
      <button class="fbtn" onclick={prevMatch} title="Previous (⇧⏎)" aria-label="Previous match">
        <span class="up"><Icon name="chevron" size={14} /></span>
      </button>
      <button class="fbtn" onclick={nextMatch} title="Next (⏎)" aria-label="Next match">
        <span class="down"><Icon name="chevron" size={14} /></span>
      </button>
      <button class="fbtn" onclick={closeFind} title="Close (Esc)" aria-label="Close find">
        <Icon name="close" size={14} />
      </button>
    </div>
  {/if}

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

  .findbar {
    position: sticky;
    top: 0;
    z-index: 20;
    margin-left: auto;
    width: fit-content;
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 6px 6px 6px 12px;
    margin-right: 18px;
    margin-top: 14px;
    background: color-mix(in srgb, var(--paper) 88%, transparent);
    backdrop-filter: saturate(1.4) blur(14px);
    -webkit-backdrop-filter: saturate(1.4) blur(14px);
    border: 1px solid var(--line-strong);
    border-radius: var(--r-pill);
    box-shadow: var(--shadow-md);
    /* float without taking layout height from the article */
    float: right;
  }
  .findbar input {
    border: none;
    outline: none;
    background: none;
    color: var(--ink);
    font-size: var(--text-sm);
    width: 190px;
  }
  .findbar input::placeholder {
    color: var(--ink-faint);
  }
  .fcount {
    font-size: var(--text-xs);
    color: var(--ink-muted);
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
    padding: 0 4px;
  }
  .fbtn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 26px;
    height: 26px;
    border-radius: var(--r-pill);
    color: var(--ink-muted);
    transition: background var(--dur-1) var(--ease), color var(--dur-1) var(--ease);
  }
  .fbtn:hover {
    background: var(--surface-2);
    color: var(--ink);
  }
  .up {
    display: inline-flex;
    transform: rotate(-90deg);
  }
  .down {
    display: inline-flex;
    transform: rotate(90deg);
  }
</style>
