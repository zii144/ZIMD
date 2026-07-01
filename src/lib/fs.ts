import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import type { FileNode } from "./types";

/** True when running inside the Tauri shell (vs. a plain browser dev view). */
export const isTauri = (): boolean =>
  typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;

/** Show the native folder picker; returns the chosen path or null. */
export async function pickFolder(): Promise<string | null> {
  const selected = await open({
    directory: true,
    multiple: false,
    title: "Open a folder of Markdown",
  });
  if (typeof selected === "string") return selected;
  return null;
}

/** Read the Markdown file tree for a folder. */
export async function readTree(path: string): Promise<FileNode[]> {
  return invoke<FileNode[]>("read_tree", { path });
}

/** Read a single Markdown file's contents. */
export async function readFile(path: string): Promise<string> {
  return invoke<string>("read_file", { path });
}

/** Get the display name for a path. */
export async function baseName(path: string): Promise<string> {
  return invoke<string>("base_name", { path });
}

/** Start watching a folder for changes (emits the `fs-change` event). */
export async function watchPath(path: string): Promise<void> {
  return invoke("watch_path", { path });
}
