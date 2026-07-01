// Small path utilities for resolving relative links/images inside documents.

/** Directory portion of a file path (forward-slash normalised). */
export function dirName(p: string): string {
  const norm = p.replace(/\\/g, "/");
  const i = norm.lastIndexOf("/");
  return i >= 0 ? norm.slice(0, i) : "";
}

/** True for links that should not be resolved against the local filesystem. */
export function isExternalUrl(href: string): boolean {
  return /^(https?:|mailto:|tel:|data:|asset:|blob:|file:|#)/i.test(href);
}

/** True for Markdown targets. */
export function isMarkdownLink(href: string): boolean {
  return /\.(md|markdown|mdown|mkd)(#.*)?$/i.test(href);
}

/**
 * Resolve a (possibly relative) target against a base directory, handling
 * `.` and `..` segments and percent-encoding. Returns a forward-slash path.
 */
export function resolvePath(baseDir: string, target: string): string {
  let rel = target;
  try {
    rel = decodeURIComponent(target);
  } catch {
    /* keep raw */
  }
  rel = rel.replace(/\\/g, "/");

  // Already absolute (posix root or Windows drive).
  if (/^([a-zA-Z]:\/|\/)/.test(rel)) return rel;

  const base = baseDir.replace(/\\/g, "/");
  const isAbs = /^([a-zA-Z]:\/|\/)/.test(base);
  const parts = base.split("/").filter(Boolean);

  for (const seg of rel.split("/")) {
    if (seg === "" || seg === ".") continue;
    if (seg === "..") parts.pop();
    else parts.push(seg);
  }

  const joined = parts.join("/");
  // Preserve a leading slash for posix absolute base dirs.
  return isAbs && !/^[a-zA-Z]:/.test(joined) ? "/" + joined : joined;
}
