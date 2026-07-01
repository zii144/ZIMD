import { writable, type Writable } from "svelte/store";
import type { FileNode, TocItem, Settings } from "./types";

const SETTINGS_KEY = "zimd.settings.v1";
const LAST_FOLDER_KEY = "zimd.lastFolder.v1";

const defaultSettings: Settings = {
  theme: "light",
  font: "sans",
  readSize: 1.075,
  measure: 46,
  sidebarOpen: true,
  tocOpen: true,
};

function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) return { ...defaultSettings, ...JSON.parse(raw) };
  } catch {
    /* ignore */
  }
  // Honour the OS preference on first run.
  if (
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-color-scheme: dark)").matches
  ) {
    return { ...defaultSettings, theme: "dark" };
  }
  return { ...defaultSettings };
}

/** Persisted user settings. */
export const settings: Writable<Settings> = writable(loadSettings());
settings.subscribe((s) => {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
  } catch {
    /* ignore */
  }
});

/** The currently opened root folder (absolute path), or null. */
export const rootFolder = writable<string | null>(
  (() => {
    try {
      return localStorage.getItem(LAST_FOLDER_KEY);
    } catch {
      return null;
    }
  })()
);
rootFolder.subscribe((v) => {
  try {
    if (v) localStorage.setItem(LAST_FOLDER_KEY, v);
    else localStorage.removeItem(LAST_FOLDER_KEY);
  } catch {
    /* ignore */
  }
});

/** The file tree for the current folder. */
export const fileTree = writable<FileNode[]>([]);

/** Path of the currently open file (null for pasted / virtual docs). */
export const currentFile = writable<string | null>(null);

/** Whether a document (file or pasted) is currently being read. */
export const docOpen = writable<boolean>(false);

/** Display title for the current document. */
export const docTitle = writable<string>("");

/** Rendered HTML of the current document. */
export const renderedHtml = writable<string>("");

/** Table of contents for the current document. */
export const toc = writable<TocItem[]>([]);

/** Reading statistics for the current document. */
export const docStats = writable<{ words: number; minutes: number } | null>(
  null
);

/** The heading id currently in view (for TOC highlighting). */
export const activeHeading = writable<string | null>(null);

/** Vertical reading progress, 0..1. */
export const readingProgress = writable<number>(0);

/** Loading / error surface. */
export const loading = writable<boolean>(false);
export const errorMsg = writable<string | null>(null);
