// Lightweight platform detection for UI decisions (window chrome, shortcut
// glyphs). Uses the user-agent so it works without extra Tauri plugins.

export type OS = "macos" | "windows" | "linux";

function detect(): OS {
  if (typeof navigator === "undefined") return "linux";
  const ua = navigator.userAgent;
  if (/Mac|iPhone|iPad|iPod/i.test(ua)) return "macos";
  if (/Win/i.test(ua)) return "windows";
  return "linux";
}

export const os: OS = detect();
export const isMac = os === "macos";
export const isWindows = os === "windows";
export const isLinux = os === "linux";

/** Modifier glyph used in keyboard hints. */
export const modKey = isMac ? "⌘" : "Ctrl";
