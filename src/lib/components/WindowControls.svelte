<script lang="ts">
  import { isTauri } from "../fs";
  import { t } from "../i18n";

  let maximized = $state(false);
  let ready = $state(false);
  let appWindow: import("@tauri-apps/api/window").Window | undefined;

  async function init() {
    if (!isTauri()) return;
    const { getCurrentWindow } = await import("@tauri-apps/api/window");
    appWindow = getCurrentWindow();
    maximized = await appWindow.isMaximized();
    await appWindow.onResized(async () => {
      if (appWindow) maximized = await appWindow.isMaximized();
    });
    ready = true;
  }

  function minimize() {
    appWindow?.minimize();
  }
  function toggleMax() {
    appWindow?.toggleMaximize();
  }
  function close() {
    appWindow?.close();
  }

  $effect(() => {
    init();
  });
</script>

{#if ready}
  <div class="wc">
    <button class="wc-btn" onclick={minimize} title={$t("wc.min")} aria-label={$t("wc.min")}>
      <svg viewBox="0 0 12 12" width="11" height="11" aria-hidden="true">
        <line x1="2" y1="6" x2="10" y2="6" />
      </svg>
    </button>
    <button
      class="wc-btn"
      onclick={toggleMax}
      title={maximized ? $t("wc.restore") : $t("wc.max")}
      aria-label={maximized ? $t("wc.restore") : $t("wc.max")}
    >
      {#if maximized}
        <svg viewBox="0 0 12 12" width="11" height="11" aria-hidden="true">
          <rect x="3" y="1.5" width="6.5" height="6.5" rx="1" />
          <rect x="1.5" y="3.5" width="6.5" height="6.5" rx="1" fill="var(--paper)" />
        </svg>
      {:else}
        <svg viewBox="0 0 12 12" width="11" height="11" aria-hidden="true">
          <rect x="2" y="2" width="8" height="8" rx="1" />
        </svg>
      {/if}
    </button>
    <button class="wc-btn close" onclick={close} title={$t("wc.close")} aria-label={$t("wc.close")}>
      <svg viewBox="0 0 12 12" width="11" height="11" aria-hidden="true">
        <line x1="2.5" y1="2.5" x2="9.5" y2="9.5" />
        <line x1="9.5" y1="2.5" x2="2.5" y2="9.5" />
      </svg>
    </button>
  </div>
{/if}

<style>
  .wc {
    display: flex;
    align-items: center;
    gap: 2px;
    margin-left: 4px;
    -webkit-app-region: no-drag;
  }
  .wc-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 30px;
    border-radius: var(--r-sm);
    color: var(--ink-muted);
    transition: background var(--dur-1) var(--ease), color var(--dur-1) var(--ease);
  }
  .wc-btn svg {
    fill: none;
    stroke: currentColor;
    stroke-width: 1.3;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
  .wc-btn:hover {
    background: var(--surface-2);
    color: var(--ink);
  }
  .wc-btn.close:hover {
    background: var(--danger);
    color: #fff;
  }
</style>
