<script lang="ts">
  // Minimal 1.6px stroke icon set, sized by font/currentColor.
  let { name, size = 18 }: { name: string; size?: number } = $props();

  const paths: Record<string, string> = {
    folder:
      "M3 6.5A1.5 1.5 0 0 1 4.5 5h3.8a1.5 1.5 0 0 1 1.06.44l1 1A1.5 1.5 0 0 0 11.4 7h8.1A1.5 1.5 0 0 1 21 8.5v9A1.5 1.5 0 0 1 19.5 19h-15A1.5 1.5 0 0 1 3 17.5z",
    "folder-open":
      "M3 7.5A1.5 1.5 0 0 1 4.5 6h3.6a1.5 1.5 0 0 1 1.06.44l.94.94A1.5 1.5 0 0 0 11.16 8H18a1.5 1.5 0 0 1 1.5 1.5v.5M3 7.5V17a1.5 1.5 0 0 0 1.5 1.5h13.2a1.5 1.5 0 0 0 1.45-1.1l1.6-6A1 1 0 0 0 20.79 10H6.2a1.5 1.5 0 0 0-1.45 1.1L3 17.5",
    file: "M6 3.5h7l5 5v11A1.5 1.5 0 0 1 16.5 21h-10A1.5 1.5 0 0 1 5 19.5v-15A1.5 1.5 0 0 1 6.5 3H6zM13 3.5V8.5H18",
    chevron: "M9 6l6 6-6 6",
    sidebar:
      "M4 5.5A1.5 1.5 0 0 1 5.5 4h13A1.5 1.5 0 0 1 20 5.5v13A1.5 1.5 0 0 1 18.5 20h-13A1.5 1.5 0 0 1 4 18.5zM9.5 4v16",
    toc: "M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01",
    sun: "M12 4v1.5M12 18.5V20M4 12h1.5M18.5 12H20M6.3 6.3l1.06 1.06M16.64 16.64l1.06 1.06M17.7 6.3l-1.06 1.06M7.36 16.64L6.3 17.7M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7z",
    moon: "M20 13.5A8 8 0 0 1 10.5 4a7 7 0 1 0 9.5 9.5z",
    "text-size": "M4 7V5h10v2M9 5v14M7 19h4M15 12v-1.5h6V12M18 10.5V19M16.5 19h3",
    serif:
      "M6 5h12M6 5v1.5M18 5v1.5M12 5v14M9.5 19h5",
    refresh:
      "M20 11a8 8 0 0 0-14.3-4.5M4 5v3.5H7.5M4 13a8 8 0 0 0 14.3 4.5M20 19v-3.5H16.5",
    search: "M11 5a6 6 0 1 0 0 12 6 6 0 0 0 0-12zM15.5 15.5L20 20",
    book: "M4 5.5A1.5 1.5 0 0 1 5.5 4H11v15H5.5A1.5 1.5 0 0 0 4 20.5zM20 5.5A1.5 1.5 0 0 0 18.5 4H13v15h5.5A1.5 1.5 0 0 1 20 20.5z",
    close: "M6 6l12 12M18 6L6 18",
    minus: "M5 12h14",
    plus: "M12 5v14M5 12h14",
    paste:
      "M9 4.5h6a1 1 0 0 1 1 1V6h2.5A1.5 1.5 0 0 1 20 7.5v11A1.5 1.5 0 0 1 18.5 20h-13A1.5 1.5 0 0 1 4 18.5v-11A1.5 1.5 0 0 1 5.5 6H8v-.5a1 1 0 0 1 1-1zM9 6h6M9 12h6M9 15.5h4",
    command:
      "M9 6a2.5 2.5 0 1 0-2.5 2.5H9zm0 0v12m0-12h6m0 0a2.5 2.5 0 1 1 2.5-2.5V6zm0 0v12m0 0a2.5 2.5 0 1 0 2.5 2.5V18zm0 0H9m0 0a2.5 2.5 0 1 1-2.5 2.5V18z",
    enter: "M20 6v5a2 2 0 0 1-2 2H5m0 0l4-4m-4 4l4 4",
  };
</script>

<svg
  width={size}
  height={size}
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="1.6"
  stroke-linecap="round"
  stroke-linejoin="round"
  aria-hidden="true"
>
  <path d={paths[name] ?? ""} />
</svg>
